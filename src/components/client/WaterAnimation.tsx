"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";

type WaterAnimationProps = {
    color: string;
    active: boolean;
    sparkling: boolean;
}

const OUTLINE = "#1a1b1e";
const METAL = "#dee2e6";
const METAL_LIGHT = "#f8f9fa";
const METAL_DARK = "#adb5bd";
/* the tap keeps a dark outline in both schemes because its fill is light, while the
   glass is see through and has to contrast with the page. These are the light scheme
   values: globals.css overrides them for dark through the classes below. They stay
   plain attributes on purpose, an unresolved var() would paint the glass black. */
const GLASS_OUTLINE = "#1a1b1e";
const GLASS_TINT = "rgba(255, 255, 255, 0.18)";
const GLASS_OUTLINE_CLASS = "glass-outline";
const GLASS_TINT_CLASS = "glass-tint";
const SHINE = "rgba(255, 255, 255, 0.5)";
const DEPTH = "rgba(0, 0, 0, 0.12)";

/* the canvas is symmetric around the glass so it stays screen centered */
const CENTER = 174;
const SPOUT_BOTTOM = 135;
const GLASS_TOP = 178;
const GLASS_BOTTOM = 314;
const LIQUID_TOP = 224;
const LIQUID_DEPTH = GLASS_BOTTOM - LIQUID_TOP;

const GLASS_HALF_TOP = 58;
const GLASS_HALF_BOTTOM = 44;

const GLASS_SIDES = `M${CENTER - GLASS_HALF_TOP} ${GLASS_TOP} L${CENTER - GLASS_HALF_BOTTOM} ${GLASS_BOTTOM} Q${CENTER} ${GLASS_BOTTOM + 10} ${CENTER + GLASS_HALF_BOTTOM} ${GLASS_BOTTOM} L${CENTER + GLASS_HALF_TOP} ${GLASS_TOP}`;
const GLASS_BODY = `${GLASS_SIDES} Z`;

const TAP_PIPE = "M-30 60 H101 Q115 60 115 74 V101 H85 V96 Q85 90 79 90 H-30 Z";

const STREAMS = [
    { d: `M${CENTER} ${SPOUT_BOTTOM} C ${CENTER + 2} 165, ${CENTER - 4} 200, ${CENTER - 1} ${LIQUID_TOP + 6}`, width: 14, dash: "46 9", speed: 0.42 },
    { d: `M${CENTER - 8} ${SPOUT_BOTTOM + 2} C ${CENTER - 15} 163, ${CENTER - 17} 202, ${CENTER - 11} ${LIQUID_TOP + 6}`, width: 6, dash: "24 18", speed: 0.55 },
    { d: `M${CENTER + 8} ${SPOUT_BOTTOM + 2} C ${CENTER + 17} 161, ${CENTER + 18} 204, ${CENTER + 10} ${LIQUID_TOP + 6}`, width: 5, dash: "15 17", speed: 0.36 },
];

const BUBBLES = [
    { dx: -32, r: 5, delay: 0 },
    { dx: 0, r: 3.5, delay: 0.7 },
    { dx: 26, r: 4.5, delay: 1.4 },
    { dx: -18, r: 3, delay: 2.1 },
    { dx: 13, r: 4, delay: 0.35 },
    { dx: -38, r: 3.5, delay: 1.05 },
    { dx: 33, r: 3, delay: 1.75 },
    { dx: 4, r: 5, delay: 2.45 },
];

const WaterAnimation = ({ color, active, sparkling }: WaterAnimationProps) => {
    const clipId = useId();
    const reduceMotion = useReducedMotion();

    const flowing = active && !reduceMotion;

    const loop = (duration: number, delay = 0, ease: "linear" | "easeInOut" = "linear") => ({
        duration, delay, repeat: Infinity, ease
    });

    return (
        <svg
            viewBox="0 0 348 330"
            width="100%"
            height="100%"
            aria-hidden="true"
            focusable="false"
            style={{ pointerEvents: "none" }}
        >
            <defs>
                <clipPath id={clipId}>
                    <path d={GLASS_BODY} />
                </clipPath>
            </defs>

            {/* wall-mounted bib tap, seen from the side */}
            <g transform={`translate(${CENTER - 115}, 0) scale(1.15)`}>
                <g stroke={OUTLINE} strokeWidth={3.6} strokeLinejoin="round">
                    {/* valve: knob, cross handle, hub, stem and stepped collars */}
                    <rect x={30} y={0} width={12} height={10} rx={4} fill={METAL} />
                    <circle cx={7} cy={14} r={7.5} fill={METAL} />
                    <circle cx={65} cy={14} r={7.5} fill={METAL} />
                    <rect x={4} y={7} width={64} height={14} rx={7} fill={METAL} />
                    <rect x={27} y={18} width={18} height={13} rx={4} fill={METAL} />
                    <rect x={31} y={28} width={10} height={14} rx={3} fill={METAL} />
                    <rect x={24} y={39} width={24} height={13} rx={4} fill={METAL} />
                    <rect x={19} y={49} width={34} height={14} rx={4} fill={METAL} />
                    {/* body */}
                    <path d={TAP_PIPE} fill={METAL} />
                    <rect x={76} y={97} width={48} height={20} rx={7} fill={METAL} />
                    <rect x={-49} y={44} width={24} height={62} rx={8} fill={METAL} />
                </g>
                <g stroke="none">
                    <rect x={-20} y={65} width={92} height={7} rx={3.5} fill={METAL_LIGHT} />
                    <rect x={-20} y={80} width={82} height={6} rx={3} fill={METAL_DARK} />
                    <rect x={104} y={72} width={6} height={26} rx={3} fill={METAL_DARK} />
                    <rect x={82} y={102} width={30} height={5} rx={2.5} fill={METAL_LIGHT} />
                    <rect x={10} y={11} width={50} height={5} rx={2.5} fill={METAL_LIGHT} />
                </g>
            </g>

            {/* falling water: curved streams flowing while dispensing */}
            <motion.g
                style={{ transformOrigin: `${CENTER}px ${SPOUT_BOTTOM}px` }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.25 }}
            >
                {STREAMS.map((stream) => (
                    <motion.path
                        key={stream.d}
                        d={stream.d}
                        fill="none"
                        stroke={color}
                        strokeWidth={stream.width}
                        strokeLinecap="round"
                        style={{ strokeDasharray: stream.dash }}
                        animate={flowing ? { strokeDashoffset: [0, -46] } : { strokeDashoffset: 0 }}
                        transition={flowing ? loop(stream.speed) : { duration: 0.2 }}
                    />
                ))}
            </motion.g>

            <g clipPath={`url(#${clipId})`}>
                <path d={GLASS_BODY} className={GLASS_TINT_CLASS} fill={GLASS_TINT} />

                <rect x={CENTER - 75} y={LIQUID_TOP} width={150} height={LIQUID_DEPTH + 20} fill={color} />
                {/* depth at the bottom of the liquid */}
                <ellipse cx={CENTER} cy={GLASS_BOTTOM + 24} rx={78} ry={48} fill={DEPTH} />

                {/* surface: still while idle, sloshing while dispensing */}
                <motion.g
                    animate={flowing ? { y: [0, -5, 0] } : { y: 0 }}
                    transition={flowing ? loop(2.1, 0, "easeInOut") : { duration: 0.4 }}
                >
                    <motion.g
                        animate={flowing ? { x: [0, -80] } : { x: 0 }}
                        transition={flowing ? loop(1) : { duration: 0.4 }}
                    >
                        <ellipse cx={CENTER - 80} cy={LIQUID_TOP} rx={40} ry={11} fill={color} />
                        <ellipse cx={CENTER} cy={LIQUID_TOP} rx={40} ry={11} fill={color} />
                        <ellipse cx={CENTER + 80} cy={LIQUID_TOP} rx={40} ry={11} fill={color} />
                    </motion.g>
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={flowing ? { x: [-60, 0], opacity: 0.3 } : { x: -30, opacity: 0 }}
                        transition={flowing ? loop(1.5) : { duration: 0.4 }}
                    >
                        <ellipse cx={CENTER - 60} cy={LIQUID_TOP + 7} rx={30} ry={8} fill="#ffffff" />
                        <ellipse cx={CENTER} cy={LIQUID_TOP + 7} rx={30} ry={8} fill="#ffffff" />
                        <ellipse cx={CENTER + 60} cy={LIQUID_TOP + 7} rx={30} ry={8} fill="#ffffff" />
                        <ellipse cx={CENTER + 120} cy={LIQUID_TOP + 7} rx={30} ry={8} fill="#ffffff" />
                    </motion.g>
                </motion.g>

                {/* deep ripple drifting the other way */}
                <motion.g
                    initial={{ opacity: 0 }}
                    animate={flowing ? { x: [0, 70], y: [0, -6, 0], opacity: 0.1 } : { x: 0, y: 0, opacity: 0 }}
                    transition={flowing ? loop(3.2, 0, "easeInOut") : { duration: 0.4 }}
                >
                    <ellipse cx={CENTER - 80} cy={LIQUID_TOP + 42} rx={60} ry={14} fill="#ffffff" />
                    <ellipse cx={CENTER + 40} cy={LIQUID_TOP + 54} rx={60} ry={14} fill="#ffffff" />
                </motion.g>

                {/* splash where the stream hits the surface */}
                <motion.ellipse
                    cx={CENTER} cy={LIQUID_TOP + 2} rx={24} ry={7}
                    fill="#ffffff"
                    initial={{ opacity: 0 }}
                    animate={flowing ? { opacity: [0.1, 0.45, 0.1], scaleX: [0.7, 1.15, 0.7] } : { opacity: 0 }}
                    style={{ transformOrigin: `${CENTER}px ${LIQUID_TOP + 2}px` }}
                    transition={flowing ? loop(0.9, 0, "easeInOut") : { duration: 0.2 }}
                />

                {sparkling && flowing && BUBBLES.map((bubble) => (
                    <motion.circle
                        key={`${bubble.dx}-${bubble.delay}`}
                        cx={CENTER + bubble.dx} cy={GLASS_BOTTOM - 18} r={bubble.r}
                        fill="#ffffff"
                        initial={{ opacity: 0 }}
                        animate={{ y: [0, -(LIQUID_DEPTH - 24)], opacity: [0, 0.75, 0] }}
                        transition={loop(1.6, bubble.delay)}
                    />
                ))}

                {/* glass shine */}
                <rect
                    x={CENTER - 50} y={GLASS_TOP + 12} width={12} height={92} rx={6} fill={SHINE}
                    transform={`rotate(4 ${CENTER - 44} ${GLASS_TOP + 58})`}
                />
                <rect x={CENTER - 33} y={GLASS_TOP + 18} width={5} height={56} rx={2.5} fill={SHINE} opacity={0.7} />
                <rect x={CENTER + GLASS_HALF_BOTTOM - 18} y={LIQUID_TOP} width={14} height={LIQUID_DEPTH} fill={DEPTH} />
            </g>

            {/* glass outline and rim, drawn last */}
            <path
                d={GLASS_SIDES}
                className={GLASS_OUTLINE_CLASS}
                fill="none" stroke={GLASS_OUTLINE} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"
            />
            <ellipse
                cx={CENTER} cy={GLASS_TOP} rx={GLASS_HALF_TOP} ry={8}
                className={`${GLASS_TINT_CLASS} ${GLASS_OUTLINE_CLASS}`}
                fill={GLASS_TINT} stroke={GLASS_OUTLINE} strokeWidth={6}
            />
        </svg>
    );
}

export default WaterAnimation;
