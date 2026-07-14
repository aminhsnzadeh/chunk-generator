import {BIOME, BIOME_COLORS, ELEVATION, MOISTURE, TEMPERATURE} from "../@data/world-constants.ts";

function getElevationBand(elevation: number) {
    if (elevation < ELEVATION.OCEAN) return 'deep ocean';
    if (elevation < ELEVATION.BEACH) return 'ocean';
    if (elevation < ELEVATION.PLAINS) return 'beach';
    if (elevation < ELEVATION.HILLS) return 'lowland';
    if (elevation < ELEVATION.MOUNTAINS) return 'highland';
    return 'peak';
}

function classifyBiome(elevation: number, moisture: number, temperature: number) {

    const band = getElevationBand(elevation)

    if (band === 'ocean') return BIOME.OCEAN;
    if (band === 'beach') return BIOME.BEACH;
    if (band === 'peak') return temperature < 0 ? BIOME.SNOW : BIOME.MOUNTAIN;
    if (band === 'highland') return BIOME.MOUNTAIN;

    const dry = moisture < MOISTURE.DRY;
    const wet = moisture > MOISTURE.MEDIUM;
    const cold = temperature < TEMPERATURE.cold;
    const hot = temperature > TEMPERATURE.hot;

    if (cold) return dry ? BIOME.TUNDRA : BIOME.TAIGA;
    if (hot && dry) return BIOME.DESERT;
    if (wet) return BIOME.RAINFOREST;
    if (moisture > -0.1) return BIOME.FOREST;
    return BIOME.PLAINS;

}

function biomeColor(biomeId: string): [number, number, number] {
    return BIOME_COLORS[biomeId] || [255, 0, 255];
}

export {
    getElevationBand,
    biomeColor,
    classifyBiome
}