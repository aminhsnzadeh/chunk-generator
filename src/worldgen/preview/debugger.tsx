import {useEffect, useRef} from 'react';
import useWorldGenController from "../../controls/worldgen.ts";
import createWorldGenerator from "../world-generator.ts";
import {biomeColor} from "../world/biome.ts";
import {elevationColor, moistureColor, temperatureColor, waterColor} from "./colors.ts";
import useDebouncedConfig from "../../hooks/useDebouncedConfig.ts";

function grayscale(v: number) {
    const t = Math.max(0, Math.min(1, (v + 1) / 2));
    const g = Math.round(t * 255);
    return [g, g, g];
}

function drawLayer<T>(canvas: HTMLCanvasElement | null, sampleFn: (x: number, z: number) => T, size: number, colorFn?: (value: T) => [number, number, number]) {
    if(!canvas) return
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(size, size);

    for (let z = 0; z < size; z++) {
        for (let x = 0; x < size; x++) {
            const value = sampleFn(x, z);
            const [r, g, b] =  colorFn ? colorFn(value) : grayscale(value as number);
            const i = (z * size + x) * 4;
            imageData.data[i] = r;
            imageData.data[i + 1] = g;
            imageData.data[i + 2] = b;
            imageData.data[i + 3] = 255;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

export default function WorldGenDebugger({ size = 200 }) {
    const config = useWorldGenController();

    const elevRef = useRef(null)
    const moistRef = useRef(null)
    const tempRef = useRef(null)
    const biomeRef = useRef(null)
    const waterRef = useRef(null)

    const debouncedConfig = useDebouncedConfig(config, 400);

// instant - elevation/moisture/temperature/biome
    useEffect(() => {
        const world = createWorldGenerator(config);
        drawLayer(elevRef.current!, (x, z) => world.getElevation(x, z), size, elevationColor);
        drawLayer(moistRef.current!, (x, z) => world.getMoisture(x, z), size, moistureColor);
        drawLayer(tempRef.current!, (x, z) => world.getTemperature(x, z), size, temperatureColor);
        drawLayer(biomeRef.current!, (x, z) => world.getBiome(x, z), size, biomeColor);
    }, [config, size]);

// debounced - rivers only
    useEffect(() => {
        const world = createWorldGenerator(debouncedConfig);
        world.ensureHydrology(0, 0, size);
        drawLayer(waterRef.current!, (x, z) => world.getWaterFeature(x, z), size, waterColor);
    }, [debouncedConfig, size]);

    return (
        <div className="fixed-debugger">
            <div>
                <p>Elevation :</p>
                <canvas ref={elevRef} width={200} height={200} />
            </div>
            <div>
                <p>Moisture :</p>
                <canvas ref={moistRef} width={200} height={200} />
            </div>
            <div>
                <p>Temperature :</p>
                <canvas ref={tempRef} width={200} height={200} />
            </div>
            <div>
                <p>Biome :</p>
                <canvas ref={biomeRef} width={200} height={200} />
            </div>
            <div>
                <p>Rivers :</p>
                <canvas ref={waterRef} width={200} height={200} />
            </div>
        </div>
    );
}