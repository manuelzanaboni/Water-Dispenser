"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Badge, Stack, Text } from "@mantine/core";

import { getAggregateDispensesForFilter, getCurrentFilter } from "@/service/db";
import { AggregateDispenseFilterModel, DispenseOperation, FilterModel } from "@/service/types";
import { findDispenseOperation, toThousandsRounded } from "@/service/utils";

const FilterPanel = () => {
    const [currentFilter, setCurrentFilter] = useState<FilterModel | null>(null);
    const [aggregateDispenses, setAggregateDispenses] = useState<AggregateDispenseFilterModel[]>([]);

    const capacity = useMemo(() => {
        if (!currentFilter) return -1;

        const used = aggregateDispenses.reduce((acc: number, d: AggregateDispenseFilterModel) =>
            acc + d.duration * (findDispenseOperation(d.operation_type) as DispenseOperation).factor,
            0
        );

        return currentFilter.qty - toThousandsRounded(used);
    }, [currentFilter, aggregateDispenses]);

    const fetchData = useCallback(async () => {
        // const data = await (await fetch("/api/filters")).json();
        // setCurrentFilter(data ?? null);
        setCurrentFilter(await getCurrentFilter() ?? null);
        setAggregateDispenses(await getAggregateDispensesForFilter() ?? [])
    }, [setCurrentFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Stack gap="xs" align="center">
            <Text size="xl">
                Filtraggio residuo
            </Text>
            <Badge
                size="xl"
                variant="gradient"
                gradient={{ from: 'blue', to: 'teal', deg: 165 }}>
                {capacity} litri
            </Badge>
        </Stack>
    );
}

export default FilterPanel;
