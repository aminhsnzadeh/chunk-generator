
interface WaterPlaneProps {
    seaLevel: number;
    heightScale: number;
    chunkSize: number;
    renderDistance: number;
    worldPosition: { x: number; z: number };
}

// sinks the plane slightly below exact sea level so it can never sit coplanar
// with terrain at that height (avoids z-fighting along shorelines/flat lowlands)
const WATER_EPSILON = 0.2;

function WaterPlane({ seaLevel, heightScale, chunkSize, renderDistance, worldPosition }: WaterPlaneProps) {
    const size = chunkSize * (renderDistance * 2 + 1);

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[worldPosition.x + chunkSize / 2, seaLevel * heightScale - WATER_EPSILON, worldPosition.z + chunkSize / 2]}
            receiveShadow
        >
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
                color="#2f6fa8"
                transparent
                opacity={0.85}
                roughness={0.15}
                metalness={0.1}
                polygonOffset
                polygonOffsetFactor={-1}
                polygonOffsetUnits={-1}
            />
        </mesh>
    );
}

export default WaterPlane