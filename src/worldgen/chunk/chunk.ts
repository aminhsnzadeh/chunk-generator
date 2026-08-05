
export interface ChunkCoord {
    cx: number;
    cz: number;
}

function worldToChunkCoord(worldX: number, worldZ: number, chunkSize: number): ChunkCoord {
    return {
        cx: Math.floor(worldX / chunkSize),
        cz: Math.floor(worldZ / chunkSize),
    };
}

function chunkOrigin(cx: number, cz: number, chunkSize: number) {
    return { originX: cx * chunkSize, originZ: cz * chunkSize };
}

function chunkKey(cx: number, cz: number): string {
    return `${cx}:${cz}`;
}

export {
    worldToChunkCoord,
    chunkOrigin,
    chunkKey
}