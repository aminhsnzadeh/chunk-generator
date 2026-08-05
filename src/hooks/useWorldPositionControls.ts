import { useEffect, useRef } from 'react';

export function useWorldPositionControls(step = 32) {
    const positionRef = useRef({ x: 0, z: 0 });

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            switch (e.key) {
                case 'ArrowUp': case 'w':
                    positionRef.current = { ...positionRef.current, z: positionRef.current.z - step };
                    break;
                case 'ArrowDown': case 's':
                    positionRef.current = { ...positionRef.current, z: positionRef.current.z + step };
                    break;
                case 'ArrowLeft': case 'a':
                    positionRef.current = { ...positionRef.current, x: positionRef.current.x - step };
                    break;
                case 'ArrowRight': case 'd':
                    positionRef.current = { ...positionRef.current, x: positionRef.current.x + step };
                    break;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [step]);

    return positionRef; // a ref, not state - avoids re-rendering React on every key press
}