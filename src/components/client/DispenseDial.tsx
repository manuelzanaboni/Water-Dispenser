"use client";

import styles from "@/components/client/DispenseDial.module.css";
import { estimateMl, formatElapsed, splitOperationName, waterLevelOffset } from "@/service/dispense";
import { DispenseOperation } from "@/service/types";
import { OPERATION_ICONS, SPARKLING_OPERATION } from "@/service/utils";

/* one wave period is 400 units: the svg is two periods wide and slides by one */
const WAVE_PATH = "M0 14 Q 100 0 200 14 T 400 14 T 600 14 T 800 14";

/* left and size in % of the dial, timings in seconds */
const BUBBLES = [
    { left: 18, size: 2.5, delay: 0, duration: 2.6 },
    { left: 30, size: 1.75, delay: 0.6, duration: 2.2 },
    { left: 42, size: 3, delay: 1.2, duration: 3 },
    { left: 55, size: 2, delay: 0.3, duration: 2.4 },
    { left: 66, size: 1.5, delay: 0.9, duration: 2 },
    { left: 78, size: 2.5, delay: 1.5, duration: 2.8 },
    { left: 36, size: 1.25, delay: 1.8, duration: 2.3 },
    { left: 60, size: 2.25, delay: 2.1, duration: 2.6 },
    { left: 48, size: 1.75, delay: 0.45, duration: 2.1 },
];

type DispenseDialProps = {
    operation: DispenseOperation;
    /* seconds since the valve opened, null while idle */
    elapsedSec: number | null;
    isDisabled: boolean;
    onToggle: () => void;
};

export default function DispenseDial({ operation, elapsedSec, isDisabled, onToggle }: DispenseDialProps) {
    const isActive = elapsedSec !== null;
    const isBubbling = isActive && operation.type === SPARKLING_OPERATION.type;
    const { title, subtitle } = splitOperationName(operation.name);
    const Icon = OPERATION_ICONS[operation.type];

    const waterColors = {
        "--water": `var(--kiosk-water-${operation.slug})`,
        "--water-strong": `var(--kiosk-water-${operation.slug}-strong)`,
    } as React.CSSProperties;

    return (
        <button
            type="button"
            className={styles.dial}
            style={waterColors}
            onClick={onToggle}
            disabled={isDisabled}
            aria-pressed={isActive}
            aria-label={`${isActive ? "Interrompi" : "Avvia"} erogazione ${operation.name}`}
        >
            <span className={styles.halo} aria-hidden />

            <span className={styles.disc}>
                <span className={styles.water} style={{ transform: `translateY(${waterLevelOffset(elapsedSec)}%)` }} aria-hidden>
                    <svg className={styles.wave} viewBox="0 0 800 28" preserveAspectRatio="none">
                        <path className={styles.waveFill} d={`${WAVE_PATH} V 28 H 0 Z`} />
                        <path className={styles.waveCrest} d={WAVE_PATH} />
                    </svg>
                </span>

                {isBubbling && BUBBLES.map(bubble => (
                    <span
                        key={bubble.left}
                        className={styles.bubble}
                        style={{
                            left: `${bubble.left}%`,
                            width: `${bubble.size}%`,
                            animationDelay: `${bubble.delay}s`,
                            animationDuration: `${bubble.duration}s`,
                        }}
                        aria-hidden
                    />
                ))}

                <span className={styles.content}>
                    {isActive
                        ? <>
                            <span className={styles.timer}>{formatElapsed(elapsedSec)}</span>
                            <span className={styles.quantity}>{estimateMl(elapsedSec, operation.factor)} ml</span>
                            <span className={styles.stopHint}>
                                <span className={styles.stopMark} aria-hidden />
                                Tocca per fermare
                            </span>
                        </>
                        : <>
                            <Icon className={styles.icon} stroke={1.7} aria-hidden />
                            <span className={styles.prompt}>Tocca per erogare</span>
                            <span className={styles.name}>{title} · {subtitle}</span>
                        </>
                    }
                </span>
            </span>
        </button>
    );
}
