import {mulberry32} from "./rng.ts";

//noise building by scratch. no simplex-noise used

function buildPermutationTable(seed: number) {
    const rand = mulberry32(seed);
    const p = [...Array(256).keys()];
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }
    return p.concat(p);
}

function fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(a: number, b: number, t: number) { return a + t * (b - a); }
function grad(hash: number, x: number, y: number) {
    const h = hash & 3;
    const u = h < 2 ? x : y, v = h < 2 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2 * v : 2 * v);
}

function perlin2(perm: number[], x: number, y: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    x -= Math.floor(x); y -= Math.floor(y);
    const u = fade(x), v = fade(y);
    const aa = perm[perm[X] + Y], ab = perm[perm[X] + Y + 1];
    const ba = perm[perm[X + 1] + Y], bb = perm[perm[X + 1] + Y + 1];
    return lerp(
        lerp(grad(aa, x, y), grad(ba, x - 1, y), u),
        lerp(grad(ab, x, y - 1), grad(bb, x - 1, y - 1), u),
        v
    );
}

//fbm: Fractal Brownian Motion
//stacks octaves of noise for natural
function fbm(perm: number[], x: number, y: number, octaves = 4, lacunarity = 2, gain = 0.5) {
    let amplitude = 1, frequency = 1, sum = 0, max = 0;
    for (let i = 0; i < octaves; i++) {
        sum += amplitude * perlin2(perm, x * frequency, y * frequency);
        max += amplitude;
        amplitude *= gain;
        frequency *= lacunarity;
    }
    return sum / max;
}

export {
    buildPermutationTable,
    perlin2,
    fbm
}