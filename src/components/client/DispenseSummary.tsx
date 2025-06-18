"use client";

import { useMemo } from "react";

import { Badge, Card, Grid, Group, Text } from '@mantine/core';

import TitledCard from "@/components/client/TitledCard";
import { DispenseModel, DispenseOperation } from "@/service/types";
import { findDispenseOperation } from "@/service/utils";

export default function DispenseSummary({ dispenses }: { dispenses: DispenseModel[] }) {

    const data = useMemo(() => {
        const summary = [0, 0, 0];

        dispenses.forEach(d => {
            const qty = d.qty ?? d.duration * (findDispenseOperation(d.operation_type) as DispenseOperation).factor;
            summary[d.operation_type - 1] += qty;
        });

        return summary
            .map(v => v / 1000)
            .map(v => (Math.round(v * 10) / 10));
    }, [dispenses]);

    return (
        <TitledCard title="Erogazioni questo mese">
            <Grid mt="md">
                {data.map((value, index) =>
                    <Grid.Col key={index} span={4}>
                        <Card shadow="md" padding="lg" radius="md">
                            <Group justify="space-between" mt="md" mb="xs">
                                <Text fw={500}>
                                    {findDispenseOperation(index + 1)?.name}
                                </Text>
                                <Badge
                                    size="xl"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'teal', deg: 165 }}>
                                    {value} litri
                                </Badge>
                            </Group>
                        </Card>
                    </Grid.Col>)}
            </Grid>
        </TitledCard >
    );
}
