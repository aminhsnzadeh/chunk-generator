// src/worldgen/ChunkManager.ts
import { worldToChunkCoord, chunkKey } from './chunk';
import { generateChunkData, type ChunkData } from './generateChunkData';
import type {WorldGenConfig} from "../../controls/worldgen.ts";

export class ChunkManager {
    private chunkSize: number
    private renderDistance: number
    private config: WorldGenConfig
    private loadedChunks: Map<string, ChunkData> = new Map()

    constructor(chunkSize: number, renderDistance: number, config: WorldGenConfig) {
        this.chunkSize = chunkSize
        this.renderDistance = renderDistance
        this.config = config
    }

    updateConfig(config: WorldGenConfig) {
        this.config = config;
        this.loadedChunks.clear()
    }

    update(playerWorldX: number, playerWorldZ: number): { added: ChunkData[]; removed: string[] } {
        const { cx: centerCx, cz: centerCz } = worldToChunkCoord(playerWorldX, playerWorldZ, this.chunkSize);

        const wantedKeys = new Set<string>();
        const added: ChunkData[] = [];

        for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
            for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
                const cx = centerCx + dx;
                const cz = centerCz + dz;
                const key = chunkKey(cx, cz);
                wantedKeys.add(key);

                if (!this.loadedChunks.has(key)) {
                    const data = generateChunkData(cx, cz, this.chunkSize, this.config);
                    this.loadedChunks.set(key, data);
                    added.push(data);
                }
            }
        }

        const removed: string[] = [];
        for (const key of this.loadedChunks.keys()) {
            if (!wantedKeys.has(key)) {
                this.loadedChunks.delete(key);
                removed.push(key);
            }
        }

        return { added, removed };
    }

    getChunk(cx: number, cz: number): ChunkData | undefined {
        return this.loadedChunks.get(chunkKey(cx, cz))
    }
}