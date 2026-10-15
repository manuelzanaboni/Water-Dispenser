"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { IconCheck } from "@tabler/icons-react";

import DispenseDial from "@/components/client/dispenser/DispenseDial";
import { useDispenseLock } from "@/components/client/shell/DispenseLock";
import styles from "@/components/client/dispenser/Dispenser.module.css";
import WaterTypeSelector from "@/components/client/dispenser/WaterTypeSelector";

import { insertDispense } from "@/service/db";
import { estimateMl, MAX_DISPENSE_SEC, splitOperationName } from "@/service/dispense";
import { turnOFF, turnON } from "@/service/gpio";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

/* the dial ignores taps for this long after a start or a stop, so a double
   tap cannot open and close the valve in the same breath */
const DEBOUNCE_MS = 1_000;
/* how often the timer and the water level move while the valve is open */
const TICK_MS = 200;
/* how long the "Erogati … ml" summary stays under the dial */
const SUMMARY_VISIBLE_MS = 5_000;

type LastDispense = {
    operation: DispenseOperation;
    durationSec: number;
};

const describeDispense = ({ operation, durationSec }: LastDispense) => {
    const { title, subtitle } = splitOperationName(operation.name);
    return `Erogati ${estimateMl(durationSec, operation.factor)} ml · ${title} · ${subtitle}`;
};

export default function Dispenser() {
    const [selected, setSelected] = useState<DispenseOperation>(DISPENSE_OPERATIONS[0]);
    const [lastDispense, setLastDispense] = useState<LastDispense | null>(null);
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

    useEffect(() => {
        if (lastDispense === null) return;

        const id = setTimeout(() => setLastDispense(null), SUMMARY_VISIBLE_MS);
        return () => clearTimeout(id);
    }, [lastDispense]);

    const debounce = useCallback(() => {
        setDebouncing(true);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => setDebouncing(false), DEBOUNCE_MS);
    }, []);

    const selectType = (operation: DispenseOperation) => {
        setSelected(operation);
        setLastDispense(null);
    };

    const start = async () => {
        const openedAt = Date.now();
        setStartedAt(openedAt);
        setNow(openedAt);
        setLastDispense(null);
        setLocked(true);
        debounce();

        await turnON(selected);
    };

    const stop = useCallback(async () => {
        if (startedAt === null) return;

        // the safety stop may fire a tick past the limit: record the limit itself
        const durationSec = Math.min(Math.round((Date.now() - startedAt) / 1000), MAX_DISPENSE_SEC);
        setStartedAt(null);
        setLastDispense({ operation: selected, durationSec });
        setLocked(false);
        debounce();

        try {
            await Promise.all([turnOFF(selected), insertDispense(selected, durationSec)]);
        } catch (error) {
            // the valve command is already wrapped in gpio.ts: this is the db insert
            console.error(`Dispense of ${durationSec}s (${selected.name}) not saved`, error);
        }
    }, [startedAt, selected, setLocked, debounce]);

    // safety net: never leave the valve open if nobody taps stop
    useEffect(() => {
        if (elapsedSec !== null && elapsedSec >= MAX_DISPENSE_SEC) stop();
    }, [elapsedSec, stop]);

    return (
        <div className={styles.screen}>
            <section className={styles.stage} aria-label="Erogazione">
                <DispenseDial
                    operation={selected}
                    elapsedSec={elapsedSec}
                    isDisabled={isDebouncing}
                    onToggle={isActive ? stop : start}
                />

                <div className={styles.status}>
                    {lastDispense
                        ? <p role="status" className={styles.summary}>
                            <IconCheck className={styles.summaryIcon} stroke={2.4} aria-hidden />
                            {describeDispense(lastDispense)}
                        </p>
                        : <p className={styles.hint}>
                            {isActive
                                ? `Il rubinetto si chiude da solo dopo ${MAX_DISPENSE_SEC} s`
                                : "Scegli l’acqua, poi tocca il cerchio"}
                        </p>
                    }
                </div>
            </section>

            <div className={styles.types}>
                <WaterTypeSelector selected={selected} isLocked={isActive} onSelect={selectType} />
            </div>
        </div>
    );
}
