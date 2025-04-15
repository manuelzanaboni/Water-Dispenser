"use client";

import { BarChart } from "@mantine/charts";

import { DispenseModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

export default function DispenseChart({ dispenses }: { dispenses: DispenseModel[] }) {

    const data = dispenses.map(element => ({
        ts: buildTimestamp(element.ts),
        duration: element.duration
    }));

    return (
        <BarChart
            h={300}
            data={data}
            dataKey="ts"
            series={[{ name: "duration", label: "Tempo erogazione" }]}
            unit="s"
            tooltipAnimationDuration={250}
            barProps={{ radius: 5 }}
        />
    );
}
