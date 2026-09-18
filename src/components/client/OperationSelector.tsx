"use client";

import { Center, SegmentedControl } from "@mantine/core";

import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS, OPERATION_ICONS, findDispenseOperation } from "@/service/utils";

type OperationSelectorProps = {
    selectedOperation: DispenseOperation,
    setSelectedOperation: (selectedOperation: DispenseOperation) => void
    isPending: boolean;
}

/* the water colors are light shades: blend them towards the text color so they
   stay readable on the control background in both light and dark scheme */
const iconColor = (color: string) => `color-mix(in srgb, ${color}, var(--mantine-color-text) 40%)`;

const OperationSelector = (props: OperationSelectorProps) => {
    const { selectedOperation, setSelectedOperation, isPending } = props;

    return <SegmentedControl
        value={String(selectedOperation.type)}
        onChange={(value) => {
            const operation = findDispenseOperation(Number(value));
            if (operation) setSelectedOperation(operation);
        }}
        data={DISPENSE_OPERATIONS.map(op => {
            const Icon = OPERATION_ICONS[op.type];
            const isSelected = op.type === selectedOperation.type;

            return {
                label: (
                    <Center style={{ gap: 10 }}>
                        {/* selected segments inherit the auto contrast label color */}
                        <span style={{ display: "flex", color: isSelected ? undefined : iconColor(op.color) }}>
                            <Icon size={30} />
                        </span>
                        <span>{op.name}</span>
                    </Center>
                ),
                value: String(op.type)
            }
        })}
        disabled={isPending}
        size="xl"
        radius="md"
        color={selectedOperation.color}
    />;
}

export default OperationSelector;
