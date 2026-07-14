// controls/scene.ts
import { useControls } from "leva";

export default function useSceneController() {
    const controls = useControls("Scene Controls", {
        azimuth: {
            value: 90,
            min: 0,
            max: 360,
            step: 1
        },
        elevation: {
            value: 15,
            min: 0,
            max: 90,
            step: 1
        },
        previewCalculations: true
    });

    return controls;
}