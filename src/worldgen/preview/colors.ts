
function elevationColor(value: number): [number, number, number] {
    const t = Math.max(0, Math.min(1, (value + 1) / 2))

    if (t < 0.35) return [40, 90, 160]
    if (t < 0.4) return [210, 190, 140]
    if (t < 0.65) return [70, 140, 60]
    if (t < 0.8) return [110, 90, 70]
    return [235, 235, 240]
}

function moistureColor(value: number): [number, number, number] {
    const t = Math.max(0, Math.min(1, (value + 1) / 2));
    const r = Math.round(190 - 140 * t);
    const g = Math.round(160 + 60 * t);
    const b = Math.round(90 + 150 * t);
    return [r, g, b];
}

function temperatureColor(value: number): [number, number, number] {
    const t = Math.max(0, Math.min(1, (value + 1) / 2));
    const r = Math.round(50 + 200 * t);
    const g = Math.round(80 + 40 * (1 - Math.abs(t - 0.5) * 2));
    const b = Math.round(230 - 190 * t);
    return [r, g, b];
}

function waterColor(value: "river" | "lake" | null): [number, number, number] {
    if (value === 'river') return [70, 140, 220];
    if (value === 'lake') return [50, 100, 180];
    return [230, 220, 190];
}

export {
    temperatureColor,
    moistureColor,
    elevationColor,
    waterColor
}