"use client";

import { useState } from "react";

import { Center, Stack } from "@mantine/core";

import DispenseControl from "@/components/client/DispenseControl";
import OperationSelector from "@/components/client/OperationSelector";

import { insertDispense } from "@/service/db";
import { turnOFF, turnON } from "@/service/gpio";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

type DispenserState = {
    selectedOperation: DispenseOperation;
    selectedPreset: null;
    isPending: boolean;
    startStopDisabled: boolean;
    timestampTracker: number;
}

const DEAFULT_STATE: DispenserState = {
    selectedOperation: DISPENSE_OPERATIONS[0],
    selectedPreset: null,
    isPending: false,
    startStopDisabled: false,
    timestampTracker: -1
}

export default function Dispenser() {

    const [dispenserState, setDispenserState] = useState<DispenserState>(DEAFULT_STATE);

    const setSelectedOperation = (selectedOperation: DispenseOperation) =>
        setDispenserState(prev => ({ ...prev, selectedOperation }));

    const handleStart = async () => {
        setDispenserState(prev => ({
            ...prev,
            isPending: true,
            startStopDisabled: true,
            timestampTracker: new Date().getTime()
        }));

        setTimeout(() => setDispenserState(prev => ({ ...prev, startStopDisabled: false })), 1000);

        await turnON(dispenserState.selectedOperation);
    }

    const handleStop = async () => {
        const { selectedOperation, timestampTracker } = dispenserState;
        setDispenserState(prev => ({
            ...prev,
            isPending: false,
            startStopDisabled: true,
            timestampTracker: -1
        }));

        setTimeout(() => setDispenserState(prev => ({ ...prev, startStopDisabled: false })), 1000);

        await Promise.all([
            turnOFF(selectedOperation),
            insertDispense(selectedOperation, Math.round((new Date().getTime() - timestampTracker) / 1000))
        ]);
    }

    return (
        <Stack h="100%" gap="md" justify="space-between">
            {/* Mid row */}
            <Center style={{ flex: 1, minHeight: 0 }}>
                <DispenseControl
                    operation={dispenserState.selectedOperation}
                    active={dispenserState.isPending}
                    disabled={dispenserState.startStopDisabled}
                    onStart={handleStart}
                    onStop={handleStop}
                />
            </Center>

            {/* Bottom row */}
            <Center>
                <OperationSelector
                    selectedOperation={dispenserState.selectedOperation}
                    setSelectedOperation={setSelectedOperation}
                    isPending={dispenserState.isPending}
                />
            </Center>
        </Stack>
    );
}
