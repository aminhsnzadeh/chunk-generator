
import { useMemo } from 'react';
import {buildGeometryFromHeightmap} from "../../worldRender/buildGeoFromHeightMap.ts";
import type {ChunkData} from "../../worldgen/chunk/generateChunkData.ts";

interface ChunkProps {
    data: ChunkData;
    chunkSize: number;
}

export default function Chunk({ data, chunkSize }: ChunkProps) {
    const geometry = useMemo(
        () => buildGeometryFromHeightmap(data, chunkSize),
        [data, chunkSize]
    );

    const worldPosX = data.cx * chunkSize
    const worldPosZ = data.cz * chunkSize

    return (
        <mesh geometry={geometry} position={[worldPosX, 0, worldPosZ]}>
            <meshStandardMaterial vertexColors />
        </mesh>
    );
}