
const ELEVATION = {
    DEEP_OCEAN: -1,
    OCEAN: -0.6,
    BEACH: -0.05,
    PLAINS: 0.2,
    HILLS: 0.5,
    MOUNTAINS: 0.75,
    SNOW: 1,
}

const MOISTURE = {
    DRY: -0.3,
    MEDIUM: 0.3,
    // above MEDIUM = wet
}

const TEMPERATURE = {
    cold: -0.3,
    hot: 0.3,
}

const BIOME = {
    DEEP_OCEAN: "deepocean",
    OCEAN: "ocean",
    BEACH: "beach",
    DESERT: "desert",
    PLAINS: "plains",
    FOREST: "forest",
    RAINFOREST: "rainforest",
    HILLS: "hills",
    TUNDRA: "tundra",
    MOUNTAIN: "mountain",
    SNOW: "snow",
    TAIGA: "taiga",
    SNOW_PEAK: "snowpeak",
}

const BIOME_INDEX: Record<string, number> = Object.fromEntries(
    Object.values(BIOME).map((biomeValue, i) => [biomeValue, i])
);

const BIOME_COLORS: Record<string, [number, number, number]> = {
    deepocean: [30, 80, 150],
    ocean: [40, 90, 160],
    beach: [210, 190, 140],
    desert: [220, 190, 100],
    plains: [140, 170, 70],
    forest: [60, 120, 50],
    rainforest: [20, 90, 40],
    taiga: [90, 130, 100],
    tundra: [180, 190, 180],
    mountain: [110, 90, 70],
    snow: [235, 235, 240],
}

const BIOME_COLOR_TABLE: [number, number, number][] = Object.values(BIOME).map(
    (biomeValue) => BIOME_COLORS[biomeValue] ?? [255, 0, 255]
);

const WATER_COLORS: Record<number, [number, number, number]> = {
    1: [70, 140, 220],
    2: [50, 100, 180],
}

export {
    ELEVATION,
    MOISTURE,
    TEMPERATURE,
    BIOME_COLORS,
    BIOME,
    BIOME_INDEX,
    WATER_COLORS,
    BIOME_COLOR_TABLE
}