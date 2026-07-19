
function buildRegionHeightmap(getElevation: (x: number, z: number) => number, originX: number, originZ: number, width: number, height: number) {
    const heights = new Float32Array(width * height);
    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            heights[z * width + x] = getElevation(originX + x, originZ + z);
        }
    }
    return { heights, width, height };
}

const NEIGHBORS = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1],
];

function computeFlowDirections({ heights, width, height }: {heights: Float32Array<ArrayBuffer>, width: number, height: number }) {
    const directions = new Int32Array(width * height).fill(-1);

    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const i = z * width + x;
            const currentHeight = heights[i];
            let steepest = -Infinity;
            let bestDir = -1;

            for (let d = 0; d < NEIGHBORS.length; d++) {
                const [dx, dz] = NEIGHBORS[d];
                const nx = x + dx, nz = z + dz;
                if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;

                const drop = currentHeight - heights[nz * width + nx];
                if (drop > steepest) {
                    steepest = drop;
                    bestDir = d;
                }
            }

            directions[i] = steepest > 0 ? bestDir : -1;
        }
    }

    return directions;
}

function computeFlowAccumulation({ heights, width, height }: {heights: Float32Array<ArrayBuffer>, width: number, height: number }, directions: Int32Array<ArrayBuffer>, getMoisture: (x: number, z: number) => number, originX: number, originZ: number) {
    const accumulation = new Float32Array(width * height);

    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const i = z * width + x;
            const moisture = getMoisture(originX + x, originZ + z); // -1..1
            const rainfall = Math.max(0.05, (moisture + 1) / 2); // normalize, floor so it's never exactly 0
            accumulation[i] = rainfall;
        }
    }

    const order = [...Array(width * height).keys()].sort((a, b) => heights[b] - heights[a]);
    for (const i of order) {
        const dir = directions[i];
        if (dir === -1) continue;
        const [dx, dz] = NEIGHBORS[dir];
        const x = i % width, z = Math.floor(i / width);
        const ni = (z + dz) * width + (x + dx);
        accumulation[ni] += accumulation[i];
    }

    return accumulation;
}

export function filterIsolatedRivers({ width, height }: { width: number, height: number }, directions: Int32Array<ArrayBuffer>, accumulation: Uint8Array<ArrayBuffer>, threshold: number) {
    const isRiverRaw = new Uint8Array(width * height);
    for (let i = 0; i < width * height; i++) {
        isRiverRaw[i] = accumulation[i] >= threshold ? 1 : 0;
    }

    const isRiverFiltered = new Uint8Array(width * height);

    for (let z = 0; z < height; z++) {
        for (let x = 0; x < width; x++) {
            const i = z * width + x;
            if (!isRiverRaw[i]) continue;

            let hasRiverNeighbor = false;

            const dir = directions[i];
            if (dir !== -1) {
                const [dx, dz] = NEIGHBORS[dir];
                const nx = x + dx, nz = z + dz;
                if (nx >= 0 && nx < width && nz >= 0 && nz < height) {
                    const ni = nz * width + nx;
                    if (isRiverRaw[ni]) hasRiverNeighbor = true;
                }
            }

            if (!hasRiverNeighbor) {
                for (const [dx, dz] of NEIGHBORS) {
                    const nx = x + dx, nz = z + dz;
                    if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;
                    const ni = nz * width + nx;
                    if (!isRiverRaw[ni]) continue;

                    const ndir = directions[ni];
                    if (ndir === -1) continue;
                    const [ndx, ndz] = NEIGHBORS[ndir];
                    if (nx + ndx === x && nz + ndz === z) { hasRiverNeighbor = true; break; }
                }
            }

            isRiverFiltered[i] = hasRiverNeighbor ? 1 : 0;
        }
    }

    return isRiverFiltered;
}

function fillDepressions({ heights, width, height }: { heights: Float32Array<ArrayBuffer>, width: number, height: number }) {
    const filled = Float32Array.from(heights);
    const visited = new Uint8Array(width * height);

    const queue: any = [];

    function pushCell(i: number, h: number) { queue.push({ i, h }); }
    function popLowest() {
        let bestIdx = 0;
        for (let k = 1; k < queue.length; k++) if (queue[k].h < queue[bestIdx].h) bestIdx = k;
        return queue.splice(bestIdx, 1)[0];
    }

    for (let x = 0; x < width; x++) {
        for (const z of [0, height - 1]) {
            const i = z * width + x;
            visited[i] = 1;
            pushCell(i, filled[i]);
        }
    }
    for (let z = 0; z < height; z++) {
        for (const x of [0, width - 1]) {
            const i = z * width + x;
            if (visited[i]) continue;
            visited[i] = 1;
            pushCell(i, filled[i]);
        }
    }

    while (queue.length > 0) {
        const { i, h } = popLowest();
        const x = i % width, z = Math.floor(i / width);

        for (const [dx, dz] of NEIGHBORS) {
            const nx = x + dx, nz = z + dz;
            if (nx < 0 || nx >= width || nz < 0 || nz >= height) continue;
            const ni = nz * width + nx;
            if (visited[ni]) continue;

            visited[ni] = 1;
            filled[ni] = Math.max(filled[ni], h);
            pushCell(ni, filled[ni]);
        }
    }

    return { heights: filled, width, height };
}

function isRiver(accumulation: Float32Array<ArrayBuffer>, heights: Float32Array<ArrayBuffer>, i: number, {
    threshold = 40,
    minElevation = 0,
    maxElevation = 0.5,
} = {}) {
    const elevation = heights[i];
    if (elevation < minElevation || elevation > maxElevation) return false;
    return accumulation[i] >= threshold;
}

function isLake(directions: Int32Array<ArrayBuffer>, heights: Float32Array<ArrayBuffer>, i: number, seaLevel = -0.05) {
    return directions[i] === -1 && heights[i] > seaLevel;
}

export {
    buildRegionHeightmap,
    computeFlowDirections,
    computeFlowAccumulation,
    fillDepressions,
    isRiver,
    isLake
}