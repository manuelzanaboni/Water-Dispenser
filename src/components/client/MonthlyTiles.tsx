import styles from "@/components/client/MonthlyTiles.module.css";
import { splitOperationName } from "@/service/dispense";
import { formatLitres, MonthlySummary } from "@/service/stats";
import { OPERATION_ICONS } from "@/service/utils";

type MonthlyTilesProps = {
    summary: MonthlySummary;
};

/* no hooks or handlers: renders on the server and ships no JS */
export default function MonthlyTiles({ summary }: MonthlyTilesProps) {
    return (
        <ul className={styles.tiles} aria-label="Litri erogati questo mese">
            {summary.types.map(({ operation, litres, share }) => {
                const Icon = OPERATION_ICONS[operation.type];
                const { title, subtitle } = splitOperationName(operation.name);
                const percent = Math.round(share * 100);

                const waterColors = {
                    "--water": `var(--kiosk-water-${operation.slug})`,
                    "--water-strong": `var(--kiosk-water-${operation.slug}-strong)`,
                } as React.CSSProperties;

                return (
                    <li key={operation.type} className={styles.tile} style={waterColors}>
                        <span className={styles.label}>
                            <span className={styles.iconBox} aria-hidden>
                                <Icon className={styles.icon} stroke={1.8} />
                            </span>
                            {title} · {subtitle}
                        </span>
                        <span className={styles.amount}>
                            <span className={styles.value}>{formatLitres(litres)}</span>
                            <span className={styles.unit}>litri</span>
                        </span>
                        <span className={styles.track} role="img" aria-label={`${percent}% del mese`}>
                            <span className={styles.bar} style={{ transform: `scaleX(${share})` }} />
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
