import * as THREE from 'three';
import type {ChunkData} from "../worldgen/chunk/generateChunkData.ts";
import {BIOME_COLOR_TABLE, WATER_COLORS} from "../@data/world-constants.ts";

export function buildGeometryFromHeightmap(
    chunk: ChunkData,
    chunkSize: number,
    heightScale = 20
): THREE.BufferGeometry {
    const { size, heights, biomes, waterFeatures } = chunk;
    const vertexCount = size * size;

    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);

    const step = chunkSize / (size - 1);

    for (let z = 0; z < size; z++) {
        for (let x = 0; x < size; x++) {
            const i = z * size + x;
            const height = heights[i] * heightScale;

            positions[i * 3 + 0] = x * step;
            positions[i * 3 + 1] = height;
            positions[i * 3 + 2] = z * step;

            const water = waterFeatures[i];
            const [r, g, b] = water === 1 || water === 2
                ? WATER_COLORS[water as 1 | 2]
                : BIOME_COLOR_TABLE[biomes[i]] ?? [255, 0, 255];

            colors[i * 3 + 0] = r / 255;
            colors[i * 3 + 1] = g / 255;
            colors[i * 3 + 2] = b / 255;
        }
    }

    const indices: number[] = [];
    for (let z = 0; z < size - 1; z++) {
        for (let x = 0; x < size - 1; x++) {
            const a = z * size + x;
            const b = a + 1;
            const c = a + size;
            const d = c + 1;
            indices.push(a, c, b);
            indices.push(b, c, d);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}