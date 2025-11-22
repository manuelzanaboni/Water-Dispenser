"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge, Card, Grid, Stack, Text } from '@mantine/core';

import TitledCard from "@/components/client/TitledCard";
import { getDispenses } from "@/service/db";
import { DispenseModel, DispenseOperation } from "@/service/types";
import { findDispenseOperation, toThousandsRounded } from "@/service/utils";

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
                {data.map((value, index) =>
                    <Grid.Col key={index} span={4}>
                        <Card shadow="md" padding="lg" radius="md">
                            <Stack gap="xs" mt="md" mb="xs">
                                <Text fw={500}>
                                    {findDispenseOperation(index + 1)?.name}
                                </Text>
                                <Badge
                                    size="xl"
                                    variant="gradient"
                                    gradient={{ from: 'blue', to: 'teal', deg: 165 }}>
                                    {value} litri
                                </Badge>
                            </Stack>
                        </Card>
                    </Grid.Col>)}
            </Grid>
        </TitledCard >
    );
}
