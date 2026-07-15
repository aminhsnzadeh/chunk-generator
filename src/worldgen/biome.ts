import { BIOME, BIOME_COLORS, ELEVATION, MOISTURE, TEMPERATURE } from "../@data/world-constants.ts";

export interface BandConfig {
    ocean: number;
    beach: number;
    plains: number;
    hills: number;
    mountains: number;
}

export interface ClimateConfig {
    dry: number;
    medium: number;
    cold: number;
    hot: number;
}

const DEFAULT_BANDS: BandConfig = {
    ocean: ELEVATION.OCEAN,
    beach: ELEVATION.BEACH,
    plains: ELEVATION.PLAINS,
    hills: ELEVATION.HILLS,
    mountains: ELEVATION.MOUNTAINS,
};

const DEFAULT_CLIMATE: ClimateConfig = {
    dry: MOISTURE.DRY,
    medium: MOISTURE.MEDIUM,
    cold: TEMPERATURE.cold,
    hot: TEMPERATURE.hot,
};

function getElevationBand(elevation: number, bands: BandConfig = DEFAULT_BANDS) {
    if (elevation < bands.ocean) return 'deep ocean';
    if (elevation < bands.beach) return 'ocean';
    if (elevation < bands.plains) return 'beach';
    if (elevation < bands.hills) return 'lowland';
    if (elevation < bands.mountains) return 'highland';
    return 'peak';
}

function classifyBiome(
    elevation: number,
    moisture: number,
    temperature: number,
    bands: BandConfig = DEFAULT_BANDS,
    climate: ClimateConfig = DEFAULT_CLIMATE,
) {
    const band = getElevationBand(elevation, bands);

    if (band === 'ocean') return BIOME.OCEAN;
    if (band === 'beach') return BIOME.BEACH;
    if (band === 'peak') return temperature < 0 ? BIOME.SNOW : BIOME.MOUNTAIN;
    if (band === 'highland') return BIOME.MOUNTAIN;

    const dry = moisture < climate.dry;
    const wet = moisture > climate.medium;
    const cold = temperature < climate.cold;
    const hot = temperature > climate.hot;

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
    classifyBiome,
    DEFAULT_BANDS,
    DEFAULT_CLIMATE,
};