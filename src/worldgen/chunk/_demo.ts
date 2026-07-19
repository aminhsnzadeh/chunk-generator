import type {WorldGenConfig} from "../../controls/worldgen.ts";
import {ChunkManager} from "./chunkManager.ts";

const testConfig: WorldGenConfig = {
    seed: 1337,
    elevation: { scale: 80, octaves: 5, lacunarity: 2, gain: 0.5, exaggeration: 1 },
    moisture: { scale: 120, octaves: 3 },
    temperature: { scale: 200, octaves: 2, latitudeBias: 0 },
    seaLevel: -0.05,
    beachLevel: 0.2,
    hillLevel: 0.5,
    mountainLevel: 0.75,
    river: { threshold: 50, minElevation: -0.4, maxElevation: 1 },
};

const manager = new ChunkManager(32, 2, testConfig); // chunkSize=32, renderDistance=2 chunks

export function simulateMove(x: number, z: number) {
    const { added, removed } = manager.update(x, z);
    console.log(`Player at (${x}, ${z})`);
    console.log(`  Added: ${added.map(c => `(${c.cx},${c.cz})`).join(', ') || 'none'}`);
    console.log(`  Removed: ${removed.join(', ') || 'none'}`);
}