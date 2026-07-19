import type {WorldGenConfig} from "../../controls/worldgen.ts";
import { chunkOrigin } from './chunk';
import createWorldGenerator from "../world-generator.ts";
import {BIOME_INDEX} from "../../@data/world-constants.ts";

export interface ChunkData {
    cx: number
    cz: number
    size: number
    heights: Float32Array
    biomes: Uint8Array
    waterFeatures: Uint8Array
}

export function generateChunkData(
    cx: number,
    cz: number,
    chunkSize: number,
    config: WorldGenConfig
): ChunkData {
    const { originX, originZ } = chunkOrigin(cx, cz, chunkSize);
    const world = createWorldGenerator(config);

    const hydroPadding = chunkSize;
    world.ensureHydrology(originX - hydroPadding, originZ - hydroPadding, chunkSize + hydroPadding * 2);

    const verticesPerSide = chunkSize + 1
    const heights = new Float32Array(verticesPerSide * verticesPerSide)
    const biomes = new Uint8Array(verticesPerSide * verticesPerSide)
    const waterFeatures = new Uint8Array(verticesPerSide * verticesPerSide)

    for (let z = 0; z < verticesPerSide; z++) {
        for (let x = 0; x < verticesPerSide; x++) {
            const worldX = originX + x
            const worldZ = originZ + z
            const i = z * verticesPerSide + x

            heights[i] = world.getElevation(worldX, worldZ)
            biomes[i] = BIOME_INDEX[world.getBiome(worldX, worldZ)] ?? 255

            const feature = world.getWaterFeature(worldX, worldZ)
            waterFeatures[i] = feature === 'river' ? 1 : feature === 'lake' ? 2 : 0
        }
    }

    return { cx, cz, size: verticesPerSide, heights, biomes, waterFeatures }
}