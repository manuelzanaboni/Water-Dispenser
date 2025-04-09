"use client";

import { useState } from "react";

import Link from "next/link";

import { ActionIcon, Button, Center, Grid, Loader, Text } from "@mantine/core";
import { IconDeviceAnalytics, IconPlayerPlayFilled, IconPlayerStopFilled, IconSettings } from "@tabler/icons-react";

import OperationSelector from "@/components/client/OperationSelector";
import RefrigeratorPanel from "@/components/client/RefrigeratorPanel";
import { insertDispense } from "@/service/db";
import { turnOFF, turnON } from "@/service/gpio";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

type DispenserState = {
    selectedOperation: DispenseOperation;
    selectedPreset: null;
    isPending: boolean;
    timestampTracker: number;
}

const DEAFULT_STATE: DispenserState = {
    selectedOperation: DISPENSE_OPERATIONS[0],
    selectedPreset: null,
    isPending: false,
    timestampTracker: -1
}

const MID_ROW_HEIGHT = "calc(100vh - 12rem)";

type DispenserProps = {
    filterCapacity: number;
}

export default function Dispenser({ filterCapacity }: DispenserProps) {
    const [dispenserState, setDispenserState] = useState<DispenserState>(DEAFULT_STATE);

    const setSelectedOperation = (selectedOperation: DispenseOperation) =>
        setDispenserState(prev => ({ ...prev, selectedOperation }));

    // const [isPending, startTransition] = useTransition();

    // const handleOperation = (op: DispenseOperation) => {
    //     startTransition(async () => {
    //         let data = await turnON(op);

    //         data = await new Promise((resolve, reject) =>
    //             // setTimeout(resolve,
    //             //     3000,
    //             //     turnOFF(op)
    //             // )

    //             setTimeout(() =>
    //                 Promise.all([turnOFF(op), insertDispense(op, 42)])
    //                     .then(([relayOp, _dbOP]) => resolve(relayOp))
    //                     .catch(reject),
    //                 3000
    //             )
    //         );
    //     });
    // }

    const handleStart = async () => {
        setDispenserState(prev => ({ ...prev, isPending: true, timestampTracker: new Date().getTime() }));
        await turnON(dispenserState.selectedOperation);
    }

    const handleStop = async () => {
        const { selectedOperation, timestampTracker } = dispenserState;
        setDispenserState(prev => ({ ...prev, isPending: false, timestampTracker: -1 }));
        await turnOFF(selectedOperation);
        await insertDispense(selectedOperation, Math.round((new Date().getTime() - timestampTracker) / 1000));
    }

    return (
        <Grid p="md" justify="space-between">
            {/* Top row */}
            <Grid.Col span="content">
                <Center>
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
                </Center>
            </Grid.Col>
            <Grid.Col span={10}>
                <Center>
                    <Text size="xl">... presets ...</Text>
                </Center>
            </Grid.Col>
            <Grid.Col span="content">
                <Center>
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
                </Center>
            </Grid.Col>

            {/* Mid row */}
            <Grid.Col span={3}>
                <RefrigeratorPanel filterCapacity={filterCapacity} />
            </Grid.Col>
            <Grid.Col span={6} h={MID_ROW_HEIGHT}>
                <Center h="100%">
                    {dispenserState.isPending ?
                        <Loader size={50} /> :
                        <Text size="xl">{dispenserState.selectedOperation.name}</Text>
                    }
                </Center>
            </Grid.Col>
            <Grid.Col span={3} h={MID_ROW_HEIGHT}>
                <Center h="100%">
                    {!dispenserState.isPending ?
                        <Button
                            size="xl"
                            leftSection={<IconPlayerPlayFilled size={45} />}
                            variant="filled"
                            color="green"
                            onClick={handleStart}
                        >
                            Avvio
                        </Button>
                        :
                        <Button
                            size="xl"
                            leftSection={<IconPlayerStopFilled size={45} />}
                            variant="filled"
                            color="red"
                            onClick={handleStop}
                        >
                            Stop
                        </Button>
                    }
                </Center>
            </Grid.Col>

            {/* Bottom row */}
            <Grid.Col span={12}>
                <Center>
                    <OperationSelector
                        selectedOperation={dispenserState.selectedOperation}
                        setSelectedOperation={setSelectedOperation}
                        isPending={dispenserState.isPending}
                    />
                </Center>
            </Grid.Col>
        </Grid>
    );
}