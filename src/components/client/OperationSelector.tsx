"use client";

import { Center, SegmentedControl } from "@mantine/core";
import { IconBeerFilled } from "@tabler/icons-react";

import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

type OperationSelectorProps = {
    selectedOperation: DispenseOperation,
    setSelectedOperation: (selectedOperation: DispenseOperation) => void
    isPending: boolean;
}

const OperationSelector = (props: OperationSelectorProps) => {
    const { selectedOperation, setSelectedOperation, isPending } = props;

    return <SegmentedControl
        value={JSON.stringify(selectedOperation)}
        onChange={(value) => setSelectedOperation(JSON.parse(value))}
        data={Object.values(DISPENSE_OPERATIONS).map(op => {
            return {
                label: (
                    <Center style={{ gap: 10 }}>
                        <IconBeerFilled size={30} />
                        <span>{op.name}</span>
                    </Center>
                ),
                value: JSON.stringify(op)
            }
        })}
        disabled={isPending}
        size="xl"
        color="blue" // ToDo
    />;
}

export default OperationSelector;
