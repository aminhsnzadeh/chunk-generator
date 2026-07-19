// controls/scene.ts
import { useControls } from "leva";


export interface WorldGenConfig {
    seed: number;
    elevation: { scale: number; octaves: number; lacunarity: number; gain: number; exaggeration: number };
    moisture: { scale: number; octaves: number };
    temperature: { scale: number; octaves: number; latitudeBias: number };
    seaLevel: number;
    beachLevel: number;
    hillLevel: number;
    mountainLevel: number;
    river: { threshold: number; minElevation: number; maxElevation: number };
}


function useWorldGenController(): WorldGenConfig {
    const elevation = useControls('Elevation', {
        scale: { value: 80, min: 20, max: 300, step: 1 },
        octaves: { value: 5, min: 1, max: 8, step: 1 },
        lacunarity: { value: 2, min: 1.5, max: 3, step: 0.05 },
        gain: { value: 0.5, min: 0.2, max: 0.8, step: 0.01 },
        exaggeration: { value: 1, min: 0.3, max: 2, step: 0.05 }, // "total elevation" control
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
        seaLevel: { value: -0.05, min: -0.5, max: 0.2, step: 0.01 },
        beachLevel: { value: 0.2, min: 0, max: 0.4, step: 0.01 },
        hillLevel: { value: 0.5, min: 0.3, max: 0.7, step: 0.01 },
        mountainLevel: { value: 0.75, min: 0.5, max: 0.95, step: 0.01 },
    });

    const river = useControls('Rivers', {
        threshold: { value: 40, min: 5, max: 200, step: 1 },
        minElevation: { value: 0, min: -0.3, max: 0.5, step: 0.01 },
        maxElevation: { value: 0.5, min: 0.2, max: 0.9, step: 0.01 },
    });

    const { seed } = useControls('World', {
        seed: { value: 1337, step: 1 },
    });

    return { seed, elevation, moisture, temperature, ...bands, river };
}

export default useWorldGenController