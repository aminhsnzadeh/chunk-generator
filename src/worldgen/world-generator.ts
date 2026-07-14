import { deriveSeed } from './rng.js';
import { buildPermutationTable, fbm } from './noise.js';
import {classifyBiome, getElevationBand} from "./biome.ts";

export default function createWorldGenerator(masterSeed: number) {
    const elevPerm = buildPermutationTable(deriveSeed(masterSeed, 'elevation'));
    const moistPerm = buildPermutationTable(deriveSeed(masterSeed, 'moisture'));
    const tempPerm = buildPermutationTable(deriveSeed(masterSeed, 'temperature'));

    const getElevation = (x: number, z: number) => fbm(elevPerm, x / 80, z / 80, 5)
    const getMoisture = (x: number, z: number) => fbm(moistPerm, x / 120, z / 120, 3)
    const getTemperature = (x: number, z: number) => fbm(tempPerm, x / 200, z / 200, 2)

    return {
        getElevation,
        getMoisture,
        getTemperature,
        getElevationBand: (x: number, z: number) => getElevationBand(getElevation(x, z)),
        getBiome: (x: number, z: number) => classifyBiome(getElevation(x, z), getMoisture(x, z), getTemperature(x, z)),
    };
}