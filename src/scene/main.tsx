// MainScene.tsx
import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import useSceneController from "../controls/scene.ts";
import CalcDebugger from "../worldgen/_debugger.tsx";

export default function MainScene() {
    const { azimuth, elevation, genDebugger } = useSceneController();

    const sunPosition = useMemo(() => {
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);
        return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    }, [azimuth, elevation]);

    return (
        <>
            <Canvas style={{ width: '100%', height: '100vh' }} camera={{ position: [100, 120, 100], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[100, 100, 50]} intensity={1} />

                <Sky sunPosition={sunPosition} />

                <OrbitControls maxPolarAngle={2} maxDistance={400} />
            </Canvas>
            {genDebugger && <CalcDebugger />}
        </>
    );
}