"use client";

import { useCallback, useEffect, useState } from "react";

import { Badge, Stack, Text } from "@mantine/core";

import { RefrigeratorModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

const FETCH_INTERVAL = 30;

const RefrigeratorPanel = () => {
    const [refrigeratorState, setRefrigeratorState] = useState<RefrigeratorModel | null>(null);

    const fetchState = useCallback(async () => {
        const state = await (await fetch("/api/refrigerators")).json() as RefrigeratorModel[];
        setRefrigeratorState(state[0] ?? null);
    }, [setRefrigeratorState]);

    useEffect(() => {
        fetchState();
        const id = setInterval(fetchState, FETCH_INTERVAL * 1000);
        return () => clearInterval(id);
    }, [fetchState]);

    return (
        <Stack gap="xs" align="center">
            <Text size="xl">
                Temperatura
            </Text>
            <Badge
                size="xl"
                variant="gradient"
                gradient={{ from: 'yellow', to: 'teal', deg: 165 }}>
                {refrigeratorState?.temperature ?
                    Math.round(refrigeratorState?.temperature * 10) / 10
                    : ""} °C
            </Badge>
            <Text size="sm">
                Ultima lettura: {refrigeratorState ? buildTimestamp(refrigeratorState.ts) : ""}
            </Text>
        </Stack>

        // <Stack>
        //     <div>Temperatura: {refrigeratorState?.temperature}</div>
        //     <div>Compressore: {refrigeratorState?.state}</div>
        //     <div>Ultima lettura: {refrigeratorState ? buildTimestamp(refrigeratorState.ts) : ""}</div>
        // </Stack>
    );
}

export default RefrigeratorPanel;