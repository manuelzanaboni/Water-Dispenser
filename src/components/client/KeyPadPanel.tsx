"use client";

import { useReducer } from "react";

import { IconBackspace, IconCheck } from "@tabler/icons-react";

import styles from "@/components/client/KeyPadPanel.module.css";
import { initialKeypad, keypadQuantity, keypadReducer } from "@/service/keypad";
import { formatDate, formatInteger } from "@/service/stats";

const SAVE_FAILED = "Registrazione non riuscita. Riprova.";

type Key = { key: string; label: string; aria: string; isEdit?: boolean };

const KEYS: Key[] = [
    ..."123456789".split("").map(digit => ({ key: digit, label: digit, aria: digit })),
    { key: "clear", label: "C", aria: "Azzera", isEdit: true },
    { key: "0", label: "0", aria: "0" },
    { key: "back", label: "", aria: "Cancella ultima cifra", isEdit: true },
];

type KeyPadPanelProps = {
    prompt: string;
    unit: string;
    cta: string;
    doneLabel: string;
    /* the last registered quantity: most replacements use the same size again */
    initialValue: number;
    onSave: (quantity: number) => Promise<void>;
};

export default function KeyPadPanel({ prompt, unit, cta, doneLabel, initialValue, onSave }: KeyPadPanelProps) {
    const [state, dispatch] = useReducer(keypadReducer, initialValue, initialKeypad);
    const quantity = keypadQuantity(state);
    const formatted = `${formatInteger(quantity)} ${unit}`;

    const save = async () => {
        dispatch({ type: "saving" });
        try {
            await onSave(quantity);
            dispatch({ type: "saved" });
        } catch (error) {
            console.error(`${doneLabel} not saved (${formatted})`, error);
            dispatch({ type: "failed", message: SAVE_FAILED });
        }
    };

    if (state.step === "done") {
        return (
            <div className={styles.done}>
                <span className={styles.doneMark} aria-hidden>
                    <IconCheck className={styles.doneIcon} stroke={2.2} />
                </span>
                <p role="status" className={styles.doneTitle}>{doneLabel}: {formatted}</p>
                <p className={styles.doneDate}>Registrato oggi, {formatDate(Date.now() / 1000)}</p>
                <button type="button" className={styles.secondary} onClick={() => dispatch({ type: "reset", value: quantity })}>
                    Fatto
                </button>
            </div>
        );
    }

    const isSaving = state.step === "saving";

    return (
        <div className={styles.panel}>
            <div className={styles.display}>
                <span className={styles.prompt}>{prompt}</span>
                <span className={styles.reading} role="status" aria-label="Valore inserito">
                    <span className={styles.value}>{formatInteger(quantity)}</span>{" "}
                    <span className={styles.unit}>{unit}</span>
                </span>
            </div>

            {state.error && <p role="alert" className={styles.error}>{state.error}</p>}

            <div className={styles.keys}>
                {KEYS.map(({ key, label, aria, isEdit }) => (
                    <button
                        key={key}
                        type="button"
                        className={styles.key}
                        data-edit={isEdit || undefined}
                        aria-label={aria}
                        disabled={isSaving}
                        onClick={() => dispatch({ type: "press", key })}
                    >
                        {key === "back" ? <IconBackspace className={styles.keyIcon} stroke={2} aria-hidden /> : label}
                    </button>
                ))}
            </div>

            <button type="button" className={styles.primary} disabled={quantity === 0 || isSaving} onClick={save}>
                <IconCheck className={styles.ctaIcon} stroke={2.6} aria-hidden />
                {cta}
            </button>
        </div>
    );
}
