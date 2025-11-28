"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BarChart } from '@mantine/charts';
import { Blockquote, SegmentedControl, Stack, Text } from "@mantine/core";
import { IconInfoCircle } from '@tabler/icons-react';

import TitledCard from "@/components/client/TitledCard";
import { getAggregateDispensesForTank, getTanks } from "@/service/db";
import { AggregateDispenseTankModel, TankModel } from "@/service/types";
import { buildDateTimestamp, SPARKLING_OPERATION, toThousandsRounded } from "@/service/utils";

export default function RefrigeratorChart() {
    const [tanks, setTanks] = useState<TankModel[]>([]);
    const [selectedTank, setSelectedTank] = useState<string>(); // stringified TankModel
    const [aggregateDispenses, setAggregateDispenses] = useState<AggregateDispenseTankModel[]>([]);

    const fetchTanks = useCallback(async () => {
        const tanks = await getTanks();
        setTanks(tanks);

        // Set the selected tank to the last one in the list
        if (tanks.length > 0) {
            setSelectedTank(JSON.stringify(tanks.at(tanks.length - 1)));
        }
    }, [setTanks]);

    useEffect(() => {
        fetchTanks();
    }, [fetchTanks]);

    const fetchDispenses = useCallback(async () => {
        if (!selectedTank) return;

        const { ts: tsFrom } = JSON.parse(selectedTank);
        const tsTo = [...tanks].sort((a, b) => b.ts - a.ts).find(t => t.ts > tsFrom)?.ts ?? Math.floor(Date.now() / 1000);
        console.log(`Selected tank from ${buildDateTimestamp(tsFrom)} to ${buildDateTimestamp(tsTo)}`);
        setAggregateDispenses(await getAggregateDispensesForTank(tsFrom, tsTo));
    }, [selectedTank]);

    useEffect(() => {
        fetchDispenses();
    }, [fetchDispenses]);

    // Render the selected tank information
    const renderSelectedTank = useMemo(() => {
        if (!selectedTank) return null;

        const { ts, qty } = JSON.parse(selectedTank);
        const total = aggregateDispenses.reduce((acc, d) => acc + d.duration * SPARKLING_OPERATION.factor, 0);

        return <Blockquote
            color="blue"
            cite={`Sostituita il ${buildDateTimestamp(ts)} - ${toThousandsRounded(qty)} Kg`}
            icon={<IconInfoCircle />}
            mt="xl"
        >
            Erogazione totale acqua frizzante per questa bombola:
            <Text size="lg" fw={700}>{toThousandsRounded(total)} litri</Text>
        </Blockquote>
    }, [selectedTank, aggregateDispenses]);

    const data = useMemo(() => aggregateDispenses.map(d => ({
        day: d.day,
        qty: toThousandsRounded(d.duration * SPARKLING_OPERATION.factor),
    })), [aggregateDispenses]);

    return (
        <TitledCard title="Utilizzo CO&#8322;">
            <>
                {renderSelectedTank}

                <BarChart
                    mt="md"
                    h={400}
                    data={data}
                    dataKey="day"
                    series={[{ name: "qty", label: "Litri" }]}
                    unit=" l"
                    tooltipAnimationDuration={250}
                    barProps={{ radius: 5 }}
                />

                <Stack mt="md" gap="md">
                    <SegmentedControl
                        value={selectedTank}
                        onChange={setSelectedTank}
                        data={tanks.map(t => ({
                            value: JSON.stringify(t),
                            label: `Bombola ${t.id}`
                        }))}
                        size="md"
                        color="blue"
                    />
                </Stack>
            </>
        </TitledCard >
    );
}
