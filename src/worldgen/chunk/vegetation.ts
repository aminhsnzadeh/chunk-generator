import { mulberry32, deriveSeed } from '../rng.ts';
import { BIOME } from '../../@data/world-constants.ts';

export type VegType = 'broadleaf' | 'conifer' | 'bush' | 'cactus';

export interface VegetationInstance {
    type: VegType;
    x: number;       // local to chunk (0..chunkSize)
    y: number;       // world-space terrain height
    z: number;       // local to chunk (0..chunkSize)
    scale: number;
    rotation: number;
}

interface VegetationRule {
    chance: number;          // spawn probability per candidate cell
    types: VegType[];        // weighted pick bag
    maxSlope?: number;       // rendered slope (rise/run) the plant tolerates
    maxElev?: number;        // raw elevation cap (e.g. treeline below snow)
}

// one candidate cell every N world units
const SPACING = 2;

// rendered slope where rock starts (matches buildGeoFromHeightMap); trees avoid rockier ground
const DEFAULT_MAX_SLOPE = 0.45;

const RULES_BY_NAME: Record<string, VegetationRule> = {
    [BIOME.FOREST]:     { chance: 0.55, types: ['broadleaf', 'broadleaf', 'broadleaf', 'bush'] },
    [BIOME.RAINFOREST]: { chance: 0.75, types: ['broadleaf', 'broadleaf', 'bush'] },
    [BIOME.TAIGA]:      { chance: 0.50, types: ['conifer', 'conifer', 'conifer', 'bush'] },
    [BIOME.TUNDRA]:     { chance: 0.12, types: ['bush'] },
    [BIOME.PLAINS]:     { chance: 0.10, types: ['bush', 'bush', 'broadleaf'] },
    [BIOME.DESERT]:     { chance: 0.04, types: ['cactus'] },
    // sparse conifers on mountain slopes, below the snowline, tolerating steeper ground
    [BIOME.MOUNTAIN]:   { chance: 0.10, types: ['conifer'], maxSlope: 0.8, maxElev: 0.85 },
};

const RULES: (VegetationRule | undefined)[] = Object.values(BIOME).map(
    (name) => RULES_BY_NAME[name]
);

export function generateVegetation(
    originX: number,
    originZ: number,
    chunkSize: number,
    heights: Float32Array,
    biomes: Uint8Array,
    waterFeatures: Uint8Array,
    seed: number,
    density: number,
    heightScale = 20,
): VegetationInstance[] {
    if (density <= 0) return [];

    const size = chunkSize + 1; // vertices per side
    const baseSeed = deriveSeed(seed, 'vegetation');
    const instances: VegetationInstance[] = [];

    const heightAt = (x: number, z: number) =>
        heights[
            Math.max(0, Math.min(size - 1, z)) * size +
            Math.max(0, Math.min(size - 1, x))
        ];

    // bilinear terrain height at fractional local coords
    const sampleHeight = (lx: number, lz: number) => {
        const x0 = Math.max(0, Math.min(size - 2, Math.floor(lx)));
        const z0 = Math.max(0, Math.min(size - 2, Math.floor(lz)));
        const tx = Math.max(0, Math.min(1, lx - x0));
        const tz = Math.max(0, Math.min(1, lz - z0));
        const h00 = heightAt(x0, z0), h10 = heightAt(x0 + 1, z0);
        const h01 = heightAt(x0, z0 + 1), h11 = heightAt(x0 + 1, z0 + 1);
        return (h00 * (1 - tx) + h10 * tx) * (1 - tz) + (h01 * (1 - tx) + h11 * tx) * tz;
    };

    for (let gz = 0; gz < chunkSize; gz += SPACING) {
        for (let gx = 0; gx < chunkSize; gx += SPACING) {
            const wx = originX + gx;
            const wz = originZ + gz;

            // deterministic rng per candidate cell -> stable across chunk reloads
            const rng = mulberry32(
                (baseSeed ^ Math.imul(wx, 73856093) ^ Math.imul(wz, 19349663)) | 0
            );

            // jitter inside the cell, keep within chunk bounds
            const lx = Math.max(0, Math.min(chunkSize - 0.001, gx + (rng() - 0.5) * SPACING));
            const lz = Math.max(0, Math.min(chunkSize - 0.001, gz + (rng() - 0.5) * SPACING));
            const vx = Math.round(lx);
            const vz = Math.round(lz);
            const i = vz * size + vx;

            const rule = RULES[biomes[i]];
            if (!rule) continue;
            if (waterFeatures[i] !== 0) continue; // no plants in rivers/lakes

            const elevation = heightAt(vx, vz);
            if (rule.maxElev !== undefined && elevation > rule.maxElev) continue;

            // rendered slope from central differences (step = 1 world unit per vertex)
            const sdx = (heightAt(vx + 1, vz) - heightAt(vx - 1, vz)) * 0.5 * heightScale;
            const sdz = (heightAt(vx, vz + 1) - heightAt(vx, vz - 1)) * 0.5 * heightScale;
            const slope = Math.sqrt(sdx * sdx + sdz * sdz);
            if (slope > (rule.maxSlope ?? DEFAULT_MAX_SLOPE)) continue;

            if (rng() >= rule.chance * density) continue;

            const type = rule.types[Math.floor(rng() * rule.types.length)];
            instances.push({
                type,
                x: lx,
                y: sampleHeight(lx, lz) * heightScale,
                z: lz,
                scale: type === 'bush' ? 0.6 + rng() * 0.4 : 0.8 + rng() * 0.6,
                rotation: rng() * Math.PI * 2,
            });
        }
    }

    return instances;
}
