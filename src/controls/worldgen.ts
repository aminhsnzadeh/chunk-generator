// controls/scene.ts
import { useControls } from "leva";

export default function useWorldGenController() {
    const controls = useControls("World Generation Preview", {
        seed: 1234
    });

    return controls;
}