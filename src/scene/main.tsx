// MainScene.tsx
import { useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import useSceneController from "../controls/scene.ts";
import CalcDebugger from "../worldgen/preview/debugger.tsx";
import ChunkedWorld from "./world/chunked-world.tsx";
import useWorldGenController from "../controls/worldgen.ts";
import WaterPlane from "./world/water.tsx";
import {useWorldPositionControls} from "../hooks/useWorldPositionControls.ts";

export default function MainScene() {
    const { azimuth, elevation, previewCalculations } = useSceneController();
    const config = useWorldGenController();

    const sunPosition = useMemo(() => {
        const phi = THREE.MathUtils.degToRad(90 - elevation);
        const theta = THREE.MathUtils.degToRad(azimuth);
        return new THREE.Vector3().setFromSphericalCoords(1, phi, theta);
    }, [azimuth, elevation]);

    const worldPositionRef = useWorldPositionControls(32);

    return (
        <>
            <Canvas gl={{ logarithmicDepthBuffer: true }} shadows style={{ width: '100%', height: '100vh' }} camera={{ position: [100, 120, 100], fov: 60 }}>

                <ambientLight intensity={0.35} />
                <hemisphereLight args={['#bcd8ff', '#5c6e4e', 0.4]} />
                <directionalLight
                    position={[100, 100, 50]}
                    intensity={1.2}
                    castShadow
                    shadow-mapSize={[2048, 2048]}
                    shadow-camera-left={-160}
                    shadow-camera-right={160}
                    shadow-camera-top={160}
                    shadow-camera-bottom={-160}
                    shadow-camera-near={10}
                    shadow-camera-far={500}
                    shadow-bias={-0.0005}
                />

                <Sky sunPosition={sunPosition} />

                <ChunkedWorld config={config} chunkSize={64} renderDistance={3} worldPosition={worldPositionRef?.current}  />
                <WaterPlane seaLevel={config.seaLevel} heightScale={20} chunkSize={64} renderDistance={3} worldPosition={worldPositionRef?.current} />

                <OrbitControls maxPolarAngle={1} maxDistance={400} />
            </Canvas>
            {previewCalculations && <CalcDebugger />}
        </>
    );
}