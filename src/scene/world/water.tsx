
interface WaterPlaneProps {
    seaLevel: number;
    heightScale: number;
    chunkSize: number;
    renderDistance: number;
    worldPosition: { x: number; z: number };
}

function WaterPlane({ seaLevel, heightScale, chunkSize, renderDistance, worldPosition }: WaterPlaneProps) {
    const size = chunkSize * (renderDistance * 2 + 1);

    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[worldPosition.x + chunkSize / 2, seaLevel * heightScale, worldPosition.z + chunkSize / 2]}
        >
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial color="#2f6fa8" transparent opacity={0.85} />
        </mesh>
    );
}

export default WaterPlane