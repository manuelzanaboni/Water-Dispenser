"use client";

import { useEffect, useState } from "react";

import styles from "@/components/client/Clock.module.css";
import { formatClock } from "@/service/utils";

/* minutes only on screen: a few ticks per minute keep it at most 15s late */
const TICK_MS = 15_000;

export default function Clock() {
    // starts empty: the server's time would not match the kiosk's at hydration
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        setNow(new Date());
        const id = setInterval(() => setNow(new Date()), TICK_MS);

        return () => clearInterval(id);
    }, []);

    return (
        <time className={styles.clock} dateTime={now?.toISOString()}>
            {now ? formatClock(now) : ""}
        </time>
    );
}
