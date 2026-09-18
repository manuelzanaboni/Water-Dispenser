"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, Grid, Group, Stack, Text } from '@mantine/core';

import TitledCard from "@/components/client/TitledCard";
import { getDispenses } from "@/service/db";
import { DispenseModel, DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS, OPERATION_ICONS, findDispenseOperation, toThousandsRounded } from "@/service/utils";

export default function MonthlyDispenseSummary() {
    const [dispenses, setDispenses] = useState<DispenseModel[]>([]);

    const data = useMemo(() => {
        const summary = [0, 0, 0];

        dispenses.forEach(d => {
            const qty = d.qty ?? d.duration * (findDispenseOperation(d.operation_type) as DispenseOperation).factor;
            summary[d.operation_type - 1] += qty;
        });

        return summary.map(toThousandsRounded)
    }, [dispenses]);

    const fetchData = useCallback(async () => {
        setDispenses(await getDispenses());
    }, [setDispenses]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <TitledCard title="Erogazioni questo mese">
            <Grid mt="md">
                {DISPENSE_OPERATIONS.map(op => {
                    const Icon = OPERATION_ICONS[op.type];

                    return (
                        <Grid.Col key={op.type} span={4}>
                            <Card
                                shadow="md"
                                padding="lg"
                                radius="md"
                                style={{
                                    position: "relative",
                                    overflow: "hidden",
                                    // hex8: an 8 digit hex keeps this working without color-mix
                                    backgroundColor: `${op.color}1f`,
                                    borderTop: `4px solid ${op.color}`
                                }}
                            >
                                <Icon
                                    size={165}
                                    stroke={1.2}
                                    color={op.color}
                                    style={{ position: "absolute", right: -30, bottom: -42, opacity: 0.35 }}
                                />

                                <Stack gap={2} style={{ position: "relative" }}>
                                    <Text size="sm" c="dimmed">
                                        {op.name}
                                    </Text>
                                    <Group gap={8} align="baseline">
                                        <Text fw={700} style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>
                                            {data[op.type - 1]}
                                        </Text>
                                        <Text size="sm" c="dimmed">litri</Text>
                                    </Group>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    );
                })}
            </Grid>
        </TitledCard >
    );
}
