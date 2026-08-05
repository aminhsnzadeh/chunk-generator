// src/components/ChunkedWorld.tsx
import {useEffect, useRef, useState} from 'react';
import { useFrame } from '@react-three/fiber';
import {ChunkManager} from "../../worldgen/chunk/chunkManager.ts";
import type {ChunkData} from "../../worldgen/chunk/generateChunkData.ts";
import type {WorldGenConfig} from "../../controls/worldgen.ts";
import Chunk from "../../components/chunk/chunk.tsx";

interface ChunkedWorldProps {
    config: WorldGenConfig;
    chunkSize: number;
    renderDistance: number;
    worldPosition:  {x: number, z: number}
}

export default function ChunkedWorld({ config, chunkSize, renderDistance, worldPosition }: ChunkedWorldProps) {
    const managerRef = useRef<ChunkManager>(null);
    const [chunks, setChunks] = useState<Map<string, ChunkData>>(new Map());

    useEffect(() => {
        managerRef.current = new ChunkManager(chunkSize, renderDistance, config);
        const { added } = managerRef.current.update(0, 0);
        setChunks(new Map(added.map(c => [`${c.cx}:${c.cz}`, c])));
    }, [config, chunkSize, renderDistance]);

    useFrame(() => {
        if(managerRef.current) {
            const { x, z } = worldPosition;
            const { added, removed } = managerRef.current.update(x, z);
            if (added.length === 0 && removed.length === 0) return;

            setChunks(prev => {
                const next = new Map(prev);
                for (const chunk of added) next.set(`${chunk.cx}:${chunk.cz}`, chunk);
                for (const key of removed) next.delete(key);
                return next;
            });
        }
    });

    return (
        <>
            {Array.from(chunks.values()).map(chunk => (
                <Chunk key={`${chunk.cx}:${chunk.cz}`} data={chunk} chunkSize={chunkSize} />
            ))}
        </>
    );
}