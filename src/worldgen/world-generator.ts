import { deriveSeed } from './rng.js';
import { buildPermutationTable, fbm } from './noise.js';
import { classifyBiome, getElevationBand } from "./biome.ts";
import {buildRegionHeightmap, computeFlowAccumulation, computeFlowDirections, fillDepressions, filterIsolatedRivers, isLake, isRiver} from "./hydrology.ts";
import type { WorldGenConfig } from "../controls/worldgen.ts";

export default function createWorldGenerator(config: WorldGenConfig) {
    const seed = config.seed;

    const elevPerm = buildPermutationTable(deriveSeed(seed, 'elevation'));
    const moistPerm = buildPermutationTable(deriveSeed(seed, 'moisture'));
    const tempPerm = buildPermutationTable(deriveSeed(seed, 'temperature'));

    const getElevation = (x: number, z: number) =>
        fbm(
            elevPerm,
            x / config.elevation.scale,
            z / config.elevation.scale,
            config.elevation.octaves,
            config.elevation.lacunarity,
            config.elevation.gain
        ) * config.elevation.exaggeration;

    const getMoisture = (x: number, z: number) =>
        fbm(moistPerm, x / config.moisture.scale, z / config.moisture.scale, config.moisture.octaves);

    const getTemperature = (x: number, z: number) =>
        fbm(tempPerm, x / config.temperature.scale, z / config.temperature.scale, config.temperature.octaves)
        + config.temperature.latitudeBias;

    let hydrologyCache: any = null;
    let hydrologyKey: any = null;

    function ensureHydrology(originX: number, originZ: number, size: number) {
        const key = JSON.stringify({
            seed, originX, originZ, size,
            elevation: config.elevation,
            moisture: config.moisture,
            river: config.river,
        });
        if (hydrologyCache && hydrologyKey === key) return hydrologyCache;

        const region = buildRegionHeightmap(getElevation, originX, originZ, size, size);
        const filledRegion = fillDepressions(region);
        const directions = computeFlowDirections(filledRegion);
        const accumulation = computeFlowAccumulation(region, directions, getMoisture, originX, originZ);

        const rawRiver = new Uint8Array(size * size);
        for (let i = 0; i < size * size; i++) {
            rawRiver[i] = isRiver(accumulation, region.heights, i, {
                threshold: config.river.threshold,
                minElevation: config.river.minElevation,
                maxElevation: config.river.maxElevation,
            }) ? 1 : 0;
        }
        const riverFiltered = filterIsolatedRivers(region, directions, rawRiver, 1);

        hydrologyCache = { region, directions, accumulation, riverFiltered, originX, originZ, size };
        hydrologyKey = key;
        return hydrologyCache;
    }

    function getWaterFeature(x: number, z: number) {
        const hydro = hydrologyCache;
        if (!hydro) return null;

        const localX = x - hydro.originX;
        const localZ = z - hydro.originZ;
        if (localX < 0 || localX >= hydro.size || localZ < 0 || localZ >= hydro.size) return null;

        const i = localZ * hydro.size + localX;

        if (isLake(hydro.directions, hydro.region.heights, i)) return 'lake';
        if (hydro.riverFiltered[i]) return 'river';
        return null;
    }

    return {
        getElevation,
        getMoisture,
        getTemperature,
        getElevationBand: (x: number, z: number) => getElevationBand(getElevation(x, z)),
        ensureHydrology,
        getWaterFeature,
        getBiome: (x: number, z: number) => classifyBiome(getElevation(x, z), getMoisture(x, z), getTemperature(x, z)),
    };
}