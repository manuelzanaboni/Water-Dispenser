"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LineChart } from "@mantine/charts";

import TitledCard from "@/components/client/TitledCard";

import { RefrigeratorModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";
import { SegmentedControl, Stack } from "@mantine/core";

export default function RefrigeratorChart() {
    const [refrigerators, setRefrigerators] = useState<RefrigeratorModel[]>([])
    const [limit, setLimit] = useState<string>("50");

    const data = useMemo(() => refrigerators.sort((a, b) => a.ts - b.ts)
        .map(element => ({
            ts: buildTimestamp(element.ts),
            temperature: element.temperature
        })), [refrigerators]);

    const fetchRefrigerators = useCallback(async () => {
        const state = await (await fetch(`/api/refrigerators?limit=${limit}`)).json() as RefrigeratorModel[];
        setRefrigerators(state);
    }, [limit, setRefrigerators]);

    useEffect(() => {
        fetchRefrigerators()
    }, [fetchRefrigerators]);

    return (
        <TitledCard title="Temperatura">
            <Stack mt="md" gap="md">
                {/* To replace with CompositeChart - https://mantine.dev/charts/composite-chart/ */}
                <LineChart
                    h={400}
                    data={data}
                    dataKey="ts"
                    series={[{ name: "temperature", label: "Temperatura" }]}
                    type="gradient"
                    gradientStops={[
                        { offset: 0, color: 'lime.5' },
                        { offset: 50, color: 'cyan.5' },
                        { offset: 100, color: 'blue.5' },
                    ]}
                    strokeWidth={7}
                    curveType="natural"
                    yAxisProps={{ domain: [0, 12] }}
                    unit="°C"
                    connectNulls={false}
                    tooltipAnimationDuration={250}
                    dotProps={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                    activeDotProps={{ r: 9, strokeWidth: 3, stroke: '#fff' }}
                />

                <SegmentedControl
                    value={limit}
                    onChange={setLimit}
                    data={[
                        { value: '50', label: '50 punti' },
                        { value: '100', label: '100 punti' },
                        { value: '300', label: '300 punti' },
                        { value: '500', label: '500 punti' },
                    ]}
                    size="md"
                    color="blue"
                />

            </Stack>
        </TitledCard >
    );
}
