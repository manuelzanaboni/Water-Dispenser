"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { IconCylinder, IconDeviceDesktop, IconFilter, IconInfoCircle } from "@tabler/icons-react";

import InfoPanel from "@/components/client/settings/InfoPanel";
import KeyPadPanel from "@/components/client/settings/KeyPadPanel";
import ScreenPanel from "@/components/client/settings/ScreenPanel";
import styles from "@/components/client/settings/SettingsScreen.module.css";
import { insertFilter, insertTank } from "@/service/db";
import { formatDate, formatInteger } from "@/service/stats";

type Section = "schermo" | "filtro" | "bombola" | "info";

type Registration = {
    qty: number;
    ts: number;
};

type SettingsScreenProps = {
    version: string;
    lastFilter: Registration | null;
    lastTank: Registration | null;
};

const describeLast = (prefix: string, registration: Registration | null, unit: string, none: string) =>
    registration ? `${prefix}: ${formatDate(registration.ts)} · ${formatInteger(registration.qty)} ${unit}` : none;

export default function SettingsScreen({ version, lastFilter, lastTank }: SettingsScreenProps) {
    const [section, setSection] = useState<Section>("schermo");
    const router = useRouter();

    /* after a registration the server page reloads its props: subtitles and stats update */
    const saveThenRefresh = (insert: (quantity: number) => Promise<void>) => async (quantity: number) => {
        await insert(quantity);
        router.refresh();
    };

    const items = [
        {
            key: "schermo" as const,
            title: "Schermo",
            subtitle: "Tema e pulsanti",
            Icon: IconDeviceDesktop,
            accent: "var(--kiosk-water-fredda-strong)",
        },
        {
            key: "filtro" as const,
            title: "Nuovo filtro",
            subtitle: describeLast("Ultimo", lastFilter, "l", "Nessun filtro registrato"),
            Icon: IconFilter,
            accent: "var(--kiosk-accent-filter)",
        },
        {
            key: "bombola" as const,
            title: "Nuova bombola CO₂",
            subtitle: describeLast("Ultima", lastTank, "g", "Nessuna bombola registrata"),
            Icon: IconCylinder,
            accent: "var(--kiosk-water-frizzante-strong)",
        },
        {
            key: "info" as const,
            title: "Informazioni",
            subtitle: `Versione ${version}`,
            Icon: IconInfoCircle,
            accent: "var(--kiosk-water-ambiente-strong)",
        },
    ];

    return (
        <div className={styles.screen}>
            <h1 className={styles.title}>Impostazioni</h1>

            <div className={styles.body}>
                <nav aria-label="Sezioni delle impostazioni" className={styles.menu}>
                    {items.map(({ key, title, subtitle, Icon, accent }) => (
                        <button
                            key={key}
                            type="button"
                            className={styles.item}
                            aria-pressed={section === key}
                            onClick={() => setSection(key)}
                            style={{ "--item-accent": accent } as React.CSSProperties}
                        >
                            <span className={styles.itemIcon} aria-hidden>
                                <Icon className={styles.icon} stroke={1.8} />
                            </span>
                            <span className={styles.itemText}>
                                <span className={styles.itemTitle}>{title}</span>{" "}
                                <span className={styles.itemSubtitle}>{subtitle}</span>
                            </span>
                        </button>
                    ))}
                </nav>

                <section className={styles.panel} aria-label={items.find(item => item.key === section)?.title}>
                    {section === "schermo" && <ScreenPanel />}
                    {section === "filtro" &&
                        <KeyPadPanel
                            key="filtro"
                            prompt="Capacità del filtro installato"
                            unit="litri"
                            cta="Registra nuovo filtro"
                            question="Registrare un nuovo filtro da"
                            doneLabel="Filtro registrato"
                            initialValue={lastFilter?.qty ?? 0}
                            onSave={saveThenRefresh(insertFilter)}
                        />
                    }
                    {section === "bombola" &&
                        <KeyPadPanel
                            key="bombola"
                            prompt="Peso di CO₂ della nuova bombola"
                            unit="g"
                            cta="Registra nuova bombola"
                            question="Registrare una nuova bombola da"
                            doneLabel="Bombola registrata"
                            initialValue={lastTank?.qty ?? 0}
                            onSave={saveThenRefresh(insertTank)}
                        />
                    }
                    {section === "info" && <InfoPanel version={version} />}
                </section>
            </div>
        </div>
    );
}
