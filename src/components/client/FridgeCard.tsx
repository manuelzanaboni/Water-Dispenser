import { IconTemperature, IconTemperatureOff } from "@tabler/icons-react";

import styles from "@/components/client/FridgeCard.module.css";
import StatsCard from "@/components/client/StatsCard";
import { FridgeSeries } from "@/service/stats";
import { formatTemperature } from "@/service/utils";

const ACCENT = "var(--kiosk-water-fredda-strong)";

/* sparkline drawing box; the svg is stretched to the card, strokes stay crisp */
const CHART_WIDTH = 100;
const CHART_HEIGHT = 40;
/* keeps a flat series from turning into a line glued to the top or bottom */
const MIN_RANGE = 1;

const sparklinePoints = ({ temperatures, min, max }: FridgeSeries): string => {
    const range = Math.max(max - min, MIN_RANGE);
    const low = (min + max) / 2 - range / 2;
    const step = temperatures.length > 1 ? CHART_WIDTH / (temperatures.length - 1) : 0;

    return temperatures
        .map((temperature, i) => `${(i * step).toFixed(2)},${(CHART_HEIGHT * (1 - (temperature - low) / range)).toFixed(2)}`)
        .join(" ");
};

type FridgeCardProps = {
    /* mirrors READ_TEMP_ENABLED */
    isEnabled: boolean;
    series: FridgeSeries | null;
};

export default function FridgeCard({ isEnabled, series }: FridgeCardProps) {
    if (!isEnabled) {
        return (
            <StatsCard
                title="Frigorifero"
                Icon={IconTemperatureOff}
                accent={ACCENT}
                isDisabled
                aside={<span className={styles.badge}>Disattivato</span>}
            >
                <span className={styles.value}>— °C</span>
                <div className={styles.placeholder} aria-hidden />
                <p className={styles.note}>La lettura della temperatura non è attiva su questo erogatore.</p>
            </StatsCard>
        );
    }

    if (!series) {
        return (
            <StatsCard title="Frigorifero" Icon={IconTemperature} accent={ACCENT}>
                <span className={styles.value}>— °C</span>
                <p className={styles.note}>Nessuna lettura nelle ultime 12 ore</p>
            </StatsCard>
        );
    }

    const points = sparklinePoints(series);
    const [low, high] = [formatTemperature(series.min), formatTemperature(series.max)];

    return (
        <StatsCard title="Frigorifero" Icon={IconTemperature} accent={ACCENT}>
            <span className={styles.amount}>
                <span className={styles.value}>{formatTemperature(series.current).replace("°", " °C")}</span>{" "}
                <span className={styles.caption}>adesso</span>
            </span>
            <svg
                className={styles.chart}
                viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`Temperatura del frigorifero nelle ultime 12 ore, tra ${low} e ${high}`}
            >
                <polygon className={styles.area} points={`0,${CHART_HEIGHT} ${points} ${CHART_WIDTH},${CHART_HEIGHT}`} />
                <polyline className={styles.line} points={points} />
            </svg>
            <footer className={styles.footer}>
                <span>min {low}</span>{" "}
                <span>max {high}</span>
            </footer>
        </StatsCard>
    );
}
