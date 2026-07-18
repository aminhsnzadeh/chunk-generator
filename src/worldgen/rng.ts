function mulberry32(seed: number) {
    let a = seed
    return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function deriveSeed(masterSeed: number, featureName: string) {
    let hash = masterSeed;

    for (let i = 0; featureName.length > i; i++) {
        hash = (Math.imul(hash, 31) + featureName.charCodeAt(i)) | 0;
    }

    return hash >>> 0;
}

export {
    mulberry32,
    deriveSeed
}