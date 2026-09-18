"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type DispenseBackgroundProps = {
    color: string;
    active: boolean;
}

const BLOBS = [
    { size: "85vw", top: "-30vh", left: "-20vw", drift: { x: [0, 140, 0], y: [0, 90, 0] }, duration: 7 },
    { size: "75vw", top: "30vh", left: "45vw", drift: { x: [0, -130, 0], y: [0, -80, 0] }, duration: 9 },
    { size: "60vw", top: "15vh", left: "5vw", drift: { x: [0, 110, 0], y: [0, -100, 0] }, duration: 6 },
    { size: "65vw", top: "45vh", left: "-10vw", drift: { x: [0, 120, 0], y: [0, -70, 0] }, duration: 11 },
    { size: "50vw", top: "-15vh", left: "55vw", drift: { x: [0, -90, 0], y: [0, 110, 0] }, duration: 8 },
    { size: "45vw", top: "55vh", left: "60vw", drift: { x: [0, -100, 0], y: [0, -60, 0] }, duration: 10 },
];

const DispenseBackground = ({ color, active }: DispenseBackgroundProps) => {
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence>
            {active && (
                <motion.div
                    key="dispense-background"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: -1,
                        overflow: "hidden",
                        pointerEvents: "none",
                        background: `linear-gradient(160deg, ${color}59, ${color}14 70%)`
                    }}
                >
                    {BLOBS.map((blob, index) => (
                        <motion.div
                            key={index}
                            style={{
                                position: "absolute",
                                top: blob.top,
                                left: blob.left,
                                width: blob.size,
                                height: blob.size,
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${color}b3 0%, ${color}40 45%, transparent 70%)`
                            }}
                            animate={reduceMotion ? undefined : blob.drift}
                            transition={{ duration: blob.duration, repeat: Infinity, ease: "easeInOut" }}
                        />
                    ))}
                    {/* keeps the glass readable against the colored blobs */}
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            background: "radial-gradient(circle at 50% 45%, var(--mantine-color-body) 0%, transparent 55%)"
                        }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default DispenseBackground;
