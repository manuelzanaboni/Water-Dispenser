"use client";

import Link from "next/link";
import { useState } from "react";

import { ActionIcon, Center, Group, Stack } from "@mantine/core";
import { IconDeviceAnalytics, IconSettings } from "@tabler/icons-react";

import DispenseBackground from "@/components/client/DispenseBackground";
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

const SCREEN_HEIGHT = "calc(100dvh - 2rem)";

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
        <Stack h={SCREEN_HEIGHT} gap="md" justify="space-between">
            <DispenseBackground
                color={dispenserState.selectedOperation.color}
                active={dispenserState.isPending}
            />

            {/* Top row */}
            <Group justify="space-between">
                <ActionIcon
                    variant="light"
                    size={60}
                    component={Link}
                    href="/stats"
                    disabled={dispenserState.isPending}
                    onClick={(e) => { if (dispenserState.isPending) e.preventDefault() }}
                >
                    <IconDeviceAnalytics size={40} />
                </ActionIcon>
                <ActionIcon
                    variant="light"
                    size={60}
                    component={Link}
                    href="/settings"
                    disabled={dispenserState.isPending}
                    onClick={(e) => { if (dispenserState.isPending) e.preventDefault() }}
                >
                    <IconSettings size={40} />
                </ActionIcon>
            </Group>

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
