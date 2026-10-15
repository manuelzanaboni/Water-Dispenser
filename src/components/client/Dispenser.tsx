"use client";

import { useEffect, useRef, useState } from "react";

import DispenseDial from "@/components/client/DispenseDial";
import { useDispenseLock } from "@/components/client/DispenseLock";
import styles from "@/components/client/Dispenser.module.css";
import WaterTypeSelector from "@/components/client/WaterTypeSelector";

import { insertDispense } from "@/service/db";
import { turnOFF, turnON } from "@/service/gpio";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

/* the dial ignores taps for this long after a start or a stop, so a double
   tap cannot open and close the valve in the same breath */
const DEBOUNCE_MS = 1_000;
/* how often the timer and the water level move while the valve is open */
const TICK_MS = 200;

export default function Dispenser() {
    const [selected, setSelected] = useState<DispenseOperation>(DISPENSE_OPERATIONS[0]);
    const [startedAt, setStartedAt] = useState<number | null>(null);
    const [now, setNow] = useState(0);
    const [isDebouncing, setDebouncing] = useState(false);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const { setLocked } = useDispenseLock();

    const isActive = startedAt !== null;
    const elapsedSec = isActive ? Math.max(0, (now - startedAt) / 1000) : null;

    useEffect(() => {
        if (startedAt === null) return;

        const id = setInterval(() => setNow(Date.now()), TICK_MS);
        return () => clearInterval(id);
    }, [startedAt]);

    useEffect(() => () => clearTimeout(debounceTimer.current), []);

    const debounce = () => {
        setDebouncing(true);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncing(false), DEBOUNCE_MS);
    };

    const start = async () => {
        const openedAt = Date.now();
        setStartedAt(openedAt);
        setNow(openedAt);
        setLocked(true);
        debounce();

        await turnON(selected);
    };

    const stop = async () => {
        if (startedAt === null) return;

        const durationSec = Math.round((Date.now() - startedAt) / 1000);
        setStartedAt(null);
        setLocked(false);
        debounce();

        try {
            await Promise.all([turnOFF(selected), insertDispense(selected, durationSec)]);
        } catch (error) {
            // the valve command is already wrapped in gpio.ts: this is the db insert
            console.error(`Dispense of ${durationSec}s (${selected.name}) not saved`, error);
        }
    };

    return (
        <div className={styles.screen}>
            <section className={styles.stage} aria-label="Erogazione">
                <DispenseDial
                    operation={selected}
                    elapsedSec={elapsedSec}
                    isDisabled={isDebouncing}
                    onToggle={isActive ? stop : start}
                />

                <p className={styles.status}>
                    {!isActive && "Scegli l’acqua, poi tocca il cerchio"}
                </p>
            </section>

            <div className={styles.types}>
                <WaterTypeSelector selected={selected} isLocked={isActive} onSelect={setSelected} />
            </div>
        </div>
    );
}
