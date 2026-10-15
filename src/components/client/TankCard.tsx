"use client";

import { useState } from "react";

import { IconChevronLeft, IconChevronRight, IconCylinder } from "@tabler/icons-react";

import StatsCard from "@/components/client/StatsCard";
import styles from "@/components/client/TankCard.module.css";
import { formatDate, formatLitres, TankPeriod } from "@/service/stats";

const ACCENT = "var(--kiosk-water-frizzante-strong)";

/* keeps the bars visible even on days with very little sparkling water */
const MIN_SCALE_LITRES = 1;

type TankCardProps = {
    /* oldest first, the tank in use last */
    periods: TankPeriod[];
};

const describePeriod = ({ from, to }: TankPeriod) =>
    to === null ? `In uso dal ${formatDate(from)}` : `${formatDate(from)} → ${formatDate(to)}`;

export default function TankCard({ periods }: TankCardProps) {
    const [index, setIndex] = useState(periods.length - 1);

    if (periods.length === 0) {
        return (
            <StatsCard title="Bombola CO₂" Icon={IconCylinder} accent={ACCENT}>
                <div className={styles.empty}>
                    <span className={styles.emptyTitle}>Nessuna bombola registrata</span>
                    <span>Registrala in Impostazioni</span>
                </div>
            </StatsCard>
        );
    }

    const period = periods[index];
    const isFirst = index === 0;
    const isCurrent = index === periods.length - 1;
    const scale = Math.max(MIN_SCALE_LITRES, ...period.bars.map(bar => bar.litres));

    const navigation = (
        <div className={styles.nav}>
            <button
                type="button"
                className={styles.navButton}
                onClick={() => setIndex(index - 1)}
                disabled={isFirst}
                aria-label="Bombola precedente"
            >
                <IconChevronLeft className={styles.navIcon} stroke={2.2} aria-hidden />
            </button>
            <span className={styles.navLabel}>
                <span className={styles.tankId}>#{period.id ?? index + 1}</span>
                <span className={styles.period}>{describePeriod(period)}</span>
            </span>
            <button
                type="button"
                className={styles.navButton}
                onClick={() => setIndex(index + 1)}
                disabled={isCurrent}
                aria-label="Bombola successiva"
            >
                <IconChevronRight className={styles.navIcon} stroke={2.2} aria-hidden />
            </button>
        </div>
    );

    return (
        <StatsCard title="Bombola CO₂" Icon={IconCylinder} accent={ACCENT}>
            {navigation}

            <span className={styles.amount}>
                <span className={styles.value}>{formatLitres(period.litres)}</span>
                <span className={styles.unit}>litri frizzante</span>
            </span>

            <div className={styles.bars} role="img" aria-label="Litri di acqua frizzante al giorno, ultimi 14 giorni della bombola">
                {period.bars.map((bar, i) => (
                    <span
                        key={bar.day}
                        className={styles.bar}
                        data-today={(isCurrent && i === period.bars.length - 1) || undefined}
                        style={{ transform: `scaleY(${bar.litres / scale})` }}
                    />
                ))}
            </div>

            <footer className={styles.footer}>
                <span>14 giorni fa</span>
                <span>{isCurrent ? "oggi" : "sostituita"}</span>
            </footer>
        </StatsCard>
    );
}
