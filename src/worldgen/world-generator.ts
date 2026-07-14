import { deriveSeed } from './rng.js';
import { buildPermutationTable, fbm } from './noise.js';

export default function createWorldGenerator(masterSeed: number) {
    const elevPerm = buildPermutationTable(deriveSeed(masterSeed, 'elevation'));
    const moistPerm = buildPermutationTable(deriveSeed(masterSeed, 'moisture'));
    const tempPerm = buildPermutationTable(deriveSeed(masterSeed, 'temperature'));

    return {
        getElevation: (x: number, z: number) => fbm(elevPerm, x / 80, z / 80, 5),
        getMoisture: (x: number, z: number) => fbm(moistPerm, x / 120, z / 120, 3),
        getTemperature: (x: number, z: number) => fbm(tempPerm, x / 200, z / 200, 2),
    };
}