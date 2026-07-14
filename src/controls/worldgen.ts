// controls/scene.ts
import { useControls } from "leva";

export default function useWorldGenController() {
    const controls = useControls("World Gen", {
        seed: 1234
    });

    return controls;
}