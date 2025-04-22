"use client";

import { useMemo } from "react";

import { BarChart } from "@mantine/charts";

import TitledCard from "@/components/client/TitledCard";
import { DispenseModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

export default function DispenseChart({ dispenses }: { dispenses: DispenseModel[] }) {

    const data = useMemo(() => dispenses.map(element => ({
        ts: buildTimestamp(element.ts),
        duration: element.duration
    })), [dispenses]);

    return (
        <TitledCard title="Erogazioni">
            <BarChart
                mt="md"
                h={400}
                data={data}
                dataKey="ts"
                series={[{ name: "duration", label: "Tempo erogazione" }]}
                unit="s"
                tooltipAnimationDuration={250}
                barProps={{ radius: 5 }}
            />
        </TitledCard >
    );
}
