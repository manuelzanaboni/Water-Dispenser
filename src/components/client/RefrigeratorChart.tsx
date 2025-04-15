"use client";

import { LineChart } from "@mantine/charts";

import { RefrigeratorModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

export default function RefrigeratorChart({ refrigeratorHistory }: { refrigeratorHistory: RefrigeratorModel[] }) {

    const data = refrigeratorHistory.map(element => ({
        ts: buildTimestamp(element.ts),
        temperature: element.temperature
    }));

    return (
        <LineChart
            h={300}
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
            yAxisProps={{ domain: [0, 20] }}
            unit="°C"
            connectNulls={false}
            tooltipAnimationDuration={250}
            dotProps={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
            activeDotProps={{ r: 9, strokeWidth: 3, stroke: '#fff' }}
        />
    );
}
