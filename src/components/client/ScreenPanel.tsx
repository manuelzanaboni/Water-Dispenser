"use client";

import { useMantineColorScheme } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { IconMoon, IconSun } from "@tabler/icons-react";

import styles from "@/components/client/ScreenPanel.module.css";
import { useButtonLayout } from "@/components/client/useButtonLayout";

/* small screen sketches for the two button layouts: dial left + column, dial top + row */
const ColumnLayoutIcon = () => (
    <svg className={styles.layoutIcon} viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
        <rect x="2" y="3" width="28" height="18" rx="3" />
        <circle cx="12" cy="12" r="5" />
        <path d="M22 7.5h5M22 12h5M22 16.5h5" />
    </svg>
);

const RowLayoutIcon = () => (
    <svg className={styles.layoutIcon} viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" aria-hidden>
        <rect x="2" y="3" width="28" height="18" rx="3" />
        <circle cx="16" cy="10" r="4" />
        <path d="M7 17.5h5M13.5 17.5h5M20 17.5h5" />
    </svg>
);

type Choice = {
    label: string;
    detail?: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
};

const ChoiceGroup = ({ title, choices }: { title: string; choices: Choice[] }) => (
    <fieldset className={styles.group}>
        <legend className={styles.legend}>{title}</legend>
        <div className={styles.choices}>
            {choices.map(({ label, detail, icon, isSelected, onSelect }) => (
                <button key={label} type="button" className={styles.choice} aria-pressed={isSelected} onClick={onSelect}>
                    {icon}
                    <span className={styles.choiceText}>
                        <span className={styles.choiceLabel}>{label}</span>
                        {detail && <>{" "}<span className={styles.choiceDetail}>{detail}</span></>}
                    </span>
                </button>
            ))}
        </div>
    </fieldset>
);

export default function ScreenPanel() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [buttonLayout, setButtonLayout] = useButtonLayout();
    const { fullscreen, toggle } = useFullscreen();

    return (
        <div className={styles.panel}>
            <ChoiceGroup
                title="Tema"
                choices={[
                    {
                        label: "Scuro",
                        icon: <IconMoon className={styles.icon} stroke={1.8} aria-hidden />,
                        isSelected: colorScheme === "dark",
                        onSelect: () => setColorScheme("dark"),
                    },
                    {
                        label: "Chiaro",
                        icon: <IconSun className={styles.icon} stroke={1.8} aria-hidden />,
                        isSelected: colorScheme === "light",
                        onSelect: () => setColorScheme("light"),
                    },
                ]}
            />

            <ChoiceGroup
                title="Pulsanti tipo di acqua"
                choices={[
                    {
                        label: "A destra",
                        detail: "in colonna",
                        icon: <ColumnLayoutIcon />,
                        isSelected: buttonLayout === "column",
                        onSelect: () => setButtonLayout("column"),
                    },
                    {
                        label: "Sotto",
                        detail: "in riga",
                        icon: <RowLayoutIcon />,
                        isSelected: buttonLayout === "row",
                        onSelect: () => setButtonLayout("row"),
                    },
                ]}
            />

            <button type="button" role="switch" aria-checked={fullscreen} className={styles.switchRow} onClick={toggle}>
                <span className={styles.choiceText}>
                    <span className={styles.choiceLabel}>Schermo intero</span>{" "}
                    <span className={styles.choiceDetail}>Nasconde le barre del browser</span>
                </span>
                <span className={styles.switch} aria-hidden>
                    <span className={styles.knob} />
                </span>
            </button>
        </div>
    );
}
