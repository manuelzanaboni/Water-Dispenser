import { IconFilter } from "@tabler/icons-react";

import styles from "@/components/client/stats/FilterGauge.module.css";
import StatsCard from "@/components/client/stats/StatsCard";
import { FilterStatus, formatDate, formatInteger } from "@/service/stats";

type FilterGaugeProps = {
    status: FilterStatus | null;
};

export default function FilterGauge({ status }: FilterGaugeProps) {
    if (!status) {
        return (
            <StatsCard title="Filtro" Icon={IconFilter} accent="var(--kiosk-accent-filter)">
                <div className={styles.empty}>
                    <span className={styles.emptyTitle}>Nessun filtro registrato</span>
                    <span>Registralo in Impostazioni</span>
                </div>
            </StatsCard>
        );
    }

    const percent = Math.round(status.remainingRatio * 100);

    return (
        <StatsCard title="Filtro" Icon={IconFilter} accent="var(--kiosk-accent-filter)">
            <div className={styles.gauge} data-low={status.isLow || undefined}>
                <svg className={styles.ring} viewBox="0 0 100 100" role="img" aria-label={`Filtro: ${percent}% di capacità residua`}>
                    <circle className={styles.track} cx="50" cy="50" r="42" />
                    {/* pathLength 100 lets the dash length be the percentage itself */}
                    <circle
                        className={styles.progress}
                        cx="50"
                        cy="50"
                        r="42"
                        pathLength={100}
                        strokeDasharray={`${percent} 100`}
                    />
                </svg>{" "}
                <span className={styles.center}>
                    <span className={styles.value}>{formatInteger(status.remainingLitres)}</span>{" "}
                    <span className={styles.caption}>{status.isLow ? "Da sostituire presto" : "litri residui"}</span>
                </span>
            </div>{" "}
            <footer className={styles.footer}>
                <span>Dal {formatDate(status.since)}</span>{" "}
                <span>su {formatInteger(status.capacityLitres)} l</span>
            </footer>
        </StatsCard>
    );
}
