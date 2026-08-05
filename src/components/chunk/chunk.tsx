
import { useMemo } from 'react';
import {buildGeometryFromHeightmap} from "../../worldRender/buildGeoFromHeightMap.ts";
import type {ChunkData} from "../../worldgen/chunk/generateChunkData.ts";
import Vegetation from "./vegetation.tsx";

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
        <group position={[worldPosX, 0, worldPosZ]}>
            <mesh geometry={geometry} castShadow receiveShadow>
                <meshStandardMaterial  vertexColors roughness={1} metalness={0} />
            </mesh>
            <Vegetation instances={data.vegetation} />
        </group>
    );
}