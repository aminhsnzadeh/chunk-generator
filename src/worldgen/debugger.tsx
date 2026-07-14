import useWorldGenController from "../controls/worldgen.ts";

export default function CalcDebugger() {

    const { seed } = useWorldGenController()

    return (
        <div className="fixed-debugger">
            {seed}
        </div>
    )
}