"use client";

import { IconCheck } from "@tabler/icons-react";

import styles from "@/components/client/dispenser/WaterTypeSelector.module.css";
import { splitOperationName } from "@/service/dispense";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS, OPERATION_ICONS } from "@/service/utils";

type WaterTypeButtonProps = {
    operation: DispenseOperation;
    isSelected: boolean;
    isDisabled: boolean;
    onSelect: (operation: DispenseOperation) => void;
};

const WaterTypeButton = ({ operation, isSelected, isDisabled, onSelect }: WaterTypeButtonProps) => {
    const { title, subtitle } = splitOperationName(operation.name);
    const Icon = OPERATION_ICONS[operation.type];

    const waterColors = {
        "--water": `var(--kiosk-water-${operation.slug})`,
        "--water-strong": `var(--kiosk-water-${operation.slug}-strong)`,
    } as React.CSSProperties;

    return (
        <button
            type="button"
            className={styles.button}
            style={waterColors}
            // the two stacked spans would otherwise be read as one word
            aria-label={operation.name}
            aria-pressed={isSelected}
            disabled={isDisabled}
            onClick={() => onSelect(operation)}
        >
            <span className={styles.iconBox} aria-hidden>
                <Icon className={styles.icon} stroke={1.8} />
            </span>
            <span className={styles.text}>
                <span className={styles.title}>{title}</span>
                <span className={styles.subtitle}>{subtitle}</span>
            </span>
            {isSelected && <IconCheck className={styles.check} stroke={2.6} aria-hidden />}
        </button>
    );
};

type WaterTypeSelectorProps = {
    selected: DispenseOperation;
    /* while water runs only the running type stays enabled */
    isLocked: boolean;
    onSelect: (operation: DispenseOperation) => void;
};

/* a column or a row of buttons: the direction follows <html data-button-layout> in CSS */
export default function WaterTypeSelector({ selected, isLocked, onSelect }: WaterTypeSelectorProps) {
    return (
        <div role="group" aria-label="Tipo di acqua" className={styles.selector}>
            {DISPENSE_OPERATIONS.map(operation => {
                const isSelected = operation.type === selected.type;

                return (
                    <WaterTypeButton
                        key={operation.type}
                        operation={operation}
                        isSelected={isSelected}
                        isDisabled={isLocked && !isSelected}
                        onSelect={onSelect}
                    />
                );
            })}
        </div>
    );
}
