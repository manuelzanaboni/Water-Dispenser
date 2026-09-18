"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Blockquote, Text } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

import TitledCard from "@/components/client/TitledCard";
import { getAggregateDispensesForFilter, getCurrentFilter } from "@/service/db";
import { AggregateDispenseFilterModel, DispenseOperation, FilterModel } from "@/service/types";
import { buildDateTimestamp, findDispenseOperation, toThousandsRounded } from "@/service/utils";

export default function FilterSummary() {
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
        setCurrentFilter(await getCurrentFilter() ?? null);
        setAggregateDispenses(await getAggregateDispensesForFilter() ?? [])
    }, [setCurrentFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <TitledCard title="Filtraggio">
            <>
                {currentFilter &&
                    <Blockquote
                        color="blue"
                        cite={`Sostituito il ${buildDateTimestamp(currentFilter.ts)} - ${currentFilter.qty} litri`}
                        icon={<IconInfoCircle />}
                        mt="xl"
                    >
                        Filtraggio residuo per questo filtro:
                        <Text size="lg" fw={700}>{capacity} litri</Text>
                    </Blockquote>
                }
            </>
        </TitledCard>
    );
}
