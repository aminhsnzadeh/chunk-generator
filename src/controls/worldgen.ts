// controls/scene.ts
import { useControls } from "leva";


export interface WorldGenConfig {
    seed: number;
    elevation: { scale: number; octaves: number; lacunarity: number; gain: number; exaggeration: number; exponent: number };
    mountain: { scale: number; octaves: number; sharpness: number; amount: number; start: number };
    moisture: { scale: number; octaves: number };
    temperature: { scale: number; octaves: number; latitudeBias: number };
    seaLevel: number;
    beachLevel: number;
    hillLevel: number;
    mountainLevel: number;
    river: { threshold: number; minElevation: number; maxElevation: number };
    vegetation: { density: number };
}


function useWorldGenController(): WorldGenConfig {
    const elevation = useControls('Elevation', {
        scale: { value: 200, min: 20, max: 300, step: 1 },
        octaves: { value: 3, min: 1, max: 8, step: 1 },
        lacunarity: { value: 2.65, min: 1.5, max: 3, step: 0.05 },
        gain: { value: 0.4, min: 0.2, max: 0.8, step: 0.01 },
        exaggeration: { value: 1.8, min: 0.3, max: 2, step: 0.05 }, // "total elevation" control
        exponent: { value: 1.25, min: 0.8, max: 2.5, step: 0.05 }, // >1 flattens lowlands, stretches peaks
    });

    const mountain = useControls('Mountains', {
        scale: { value: 45, min: 10, max: 150, step: 1 },
        octaves: { value: 4, min: 1, max: 8, step: 1 },
        sharpness: { value: 2, min: 1, max: 4, step: 0.1 }, // higher = sharper rocky crests
        amount: { value: 0.45, min: 0, max: 1, step: 0.05 }, // extra height added to mountains
        start: { value: 0.3, min: 0, max: 0.7, step: 0.05 }, // elevation where ridged mountains kick in
    });

    const moisture = useControls('Moisture', {
        scale: { value: 120, min: 30, max: 300, step: 1 },
        octaves: { value: 3, min: 1, max: 6, step: 1 },
    });

    const temperature = useControls('Temperature', {
        scale: { value: 200, min: 30, max: 400, step: 1 },
        octaves: { value: 2, min: 1, max: 6, step: 1 },
        latitudeBias: { value: 0, min: -1, max: 1, step: 0.05 }, // shifts overall hot/cold
    });

    const bands = useControls('Elevation bands', {
        seaLevel: { value: 0, min: -0.5, max: 0.2, step: 0.01 },
        beachLevel: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
        hillLevel: { value: 0.5, min: 0.3, max: 0.7, step: 0.01 },
        mountainLevel: { value: 0.75, min: 0.5, max: 0.95, step: 0.01 },
    });

    const river = useControls('Rivers', {
        threshold: { value: 40, min: 5, max: 200, step: 1 },
        minElevation: { value: 0, min: -0.3, max: 0.5, step: 0.01 },
        maxElevation: { value: 0.5, min: 0.2, max: 0.9, step: 0.01 },
    });

    const vegetation = useControls('Vegetation', {
        density: { value: 1, min: 0, max: 3, step: 0.05 }, // 0 disables vegetation
    });

    const { seed } = useControls('World', {
        seed: { value: 1337, step: 1 },
    });

    return { seed, elevation, mountain, moisture, temperature, ...bands, river, vegetation };
}

export default useWorldGenController