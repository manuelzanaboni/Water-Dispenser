import styles from "@/components/client/InfoPanel.module.css";

type InfoPanelProps = {
    version: string;
};

export default function InfoPanel({ version }: InfoPanelProps) {
    const rows = [
        ["Versione", version],
        ["Erogatore", "BWT AQA drink U20 CAS"],
        ["Scheda", "Orange Pi Zero 3"],
    ];

    return (
        <dl className={styles.list}>
            {rows.map(([term, detail]) => (
                <div key={term} className={styles.row}>
                    <dt className={styles.term}>{term}</dt>
                    <dd className={styles.detail}>{detail}</dd>
                </div>
            ))}
        </dl>
    );
}
