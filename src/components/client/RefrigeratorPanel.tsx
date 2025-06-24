"use client";

import { useCallback, useEffect, useState } from "react";

import { Stack } from "@mantine/core";

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
        <Stack>
            <div>Temperatura: {refrigeratorState?.temperature}</div>
            <div>Compressore: {refrigeratorState?.state}</div>
            <div>Ultima lettura: {refrigeratorState ? buildTimestamp(refrigeratorState.ts) : ""}</div>
        </Stack>
    );
}

export default RefrigeratorPanel;