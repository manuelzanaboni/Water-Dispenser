"use client";

import { motion, useReducedMotion } from "motion/react";

type DispenseBackgroundProps = {
    color: string;
    active: boolean;
}

const DispenseBackground = ({ color, active }: DispenseBackgroundProps) => {
    const reduceMotion = useReducedMotion();

    const drifting = active && !reduceMotion;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: -1,
                overflow: "hidden",
                pointerEvents: "none"
            }}
        >
            {/* water picture, light or dark depending on the scheme: see globals.css.
                It sits still until water is running */}
            <motion.div
                className="dispense-background"
                style={{ position: "absolute", inset: "-8%" }}
                animate={drifting ? { scale: [1, 1.08, 1], x: [0, -24, 0], y: [0, 14, 0] } : { scale: 1, x: 0, y: 0 }}
                transition={drifting
                    ? { duration: 22, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.6 }
                }
            />
            {/* washed with the water type colour only while dispensing */}
            <motion.div
                style={{ position: "absolute", inset: 0, backgroundColor: color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: active ? 0.2 : 0 }}
                transition={{ duration: 0.6 }}
            />
        </div>
    );
}

export default DispenseBackground;
