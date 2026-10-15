import styles from "@/components/client/stats/StatsCard.module.css";

type StatsCardProps = {
    title: string;
    Icon: React.ComponentType<{ className?: string; stroke?: number }>;
    /* CSS color for the title icon, usually a --kiosk-* token */
    accent: string;
    /* small control or badge on the right of the title */
    aside?: React.ReactNode;
    isDisabled?: boolean;
    children: React.ReactNode;
};

/* the frame shared by the three cards at the bottom of the stats screen */
export default function StatsCard({ title, Icon, accent, aside, isDisabled, children }: StatsCardProps) {
    return (
        <section
            className={styles.card}
            aria-label={title}
            // styling hook only: a region cannot be aria-disabled, the card says it in words
            data-disabled={isDisabled || undefined}
            style={{ "--card-accent": accent } as React.CSSProperties}
        >
            <header className={styles.header}>
                <h2 className={styles.title}>
                    <Icon className={styles.icon} stroke={1.8} />
                    {title}
                </h2>
                {aside}
            </header>
            {children}
        </section>
    );
}
