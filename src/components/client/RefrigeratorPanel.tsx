"use client";

import { useCallback, useEffect, useState } from "react";

import { Center, Stack } from "@mantine/core";

import { RefrigeratorModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

type RefrigeratorPanelProps = {
    filterCapacity: number;
}

const FETCH_INTERVAL = 30;

const RefrigeratorPanel = ({ filterCapacity }: RefrigeratorPanelProps) => {
    const [refrigeratorState, setRefrigeratorState] = useState<RefrigeratorModel | null>(null);

    const fetchState = useCallback(async () => {
        const state = await (await fetch("/api/refrigerator")).json() as RefrigeratorModel | null;
        setRefrigeratorState(state);
    }, [setRefrigeratorState]);

    useEffect(() => {
        fetchState();
        const id = setInterval(fetchState, FETCH_INTERVAL * 1000);
        return () => clearInterval(id);
    }, [fetchState])

    return (
        <Center h="100%">
            <Stack>
                <div>Filtro: {filterCapacity}</div>
                <div>Temperatura: {refrigeratorState?.temperature}</div>
                <div>Compressore: {refrigeratorState?.state}</div>
                <div>Ultima lettura: {refrigeratorState ? buildTimestamp(refrigeratorState.ts) : ""}</div>
            </Stack>
        </Center>
    );
}

export default RefrigeratorPanel;