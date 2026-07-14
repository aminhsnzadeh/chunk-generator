import {useEffect, useRef} from 'react';
import useWorldGenController from "../../controls/worldgen.ts";
import createWorldGenerator from "../world-generator.ts";
import {biomeColor} from "../biome.ts";
import {elevationColor, moistureColor, temperatureColor} from "./colors.ts";

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
    const elevRef = useRef(null)
    const moistRef = useRef(null)
    const tempRef = useRef(null)
    const biomeRef = useRef(null)

    const { seed } = useWorldGenController()

    useEffect(() => {
        const world = createWorldGenerator(seed);

        drawLayer(elevRef.current, (x: number, z: number) => world.getElevation(x, z), size, elevationColor);
        drawLayer(moistRef.current, (x: number, z: number) => world.getMoisture(x, z), size, moistureColor);
        drawLayer(tempRef.current, (x: number, z: number) => world.getTemperature(x, z), size, temperatureColor);
        drawLayer(biomeRef.current, (x: number, z: number) => world.getBiome(x, z), size, biomeColor);
    }, [seed, size])

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
        </div>
    );
}