"use client";

import { useEffect, useState } from "react";

import { IconTemperature, IconTemperatureOff } from "@tabler/icons-react";

import styles from "@/components/client/FridgeChip.module.css";
import { formatTemperature } from "@/service/utils";

const POLL_INTERVAL_MS = 30_000;

type FridgeChipProps = {
    /* mirrors READ_TEMP_ENABLED: off means there is no sensor reading to show */
    isEnabled: boolean;
};

/* the API returns an array of readings (or null on a db error): keep only a valid number */
const latestTemperature = (body: unknown): number | null => {
    if (!Array.isArray(body)) return null;

    const temperature: unknown = body[0]?.temperature;
    return typeof temperature === "number" ? temperature : null;
};

export default function FridgeChip({ isEnabled }: FridgeChipProps) {
    const [temperature, setTemperature] = useState<number | null>(null);

    useEffect(() => {
        if (!isEnabled) return;

        const controller = new AbortController();

        const fetchLatest = async () => {
            try {
                const response = await fetch("/api/refrigerators?limit=1", { signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                setTemperature(latestTemperature(await response.json()));
            } catch (error) {
                if (controller.signal.aborted) return;

                console.error("Fridge temperature unavailable", error);
                setTemperature(null);
            }
        };

        fetchLatest();
        const id = setInterval(fetchLatest, POLL_INTERVAL_MS);

        return () => {
            controller.abort();
            clearInterval(id);
        };
    }, [isEnabled]);

    const Icon = isEnabled ? IconTemperature : IconTemperatureOff;

    return (
        <div
            className={styles.chip}
            aria-disabled={!isEnabled || undefined}
            title={isEnabled ? undefined : "Lettura temperatura disattivata"}
        >
            <Icon className={styles.icon} stroke={1.8} aria-hidden />
            <span className={styles.value}>{formatTemperature(isEnabled ? temperature : null)}</span>
            <span className={styles.label}>Frigo</span>
        </div>
    );
}
