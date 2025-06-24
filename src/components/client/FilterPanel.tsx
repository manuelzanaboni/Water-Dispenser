"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getAggregateDispenses, getCurrentFilter } from "@/service/db";
import { AggregateDispenseModel, DispenseOperation, FilterModel } from "@/service/types";
import { findDispenseOperation } from "@/service/utils";

const FilterPanel = () => {
    const [currentFilter, setCurrentFilter] = useState<FilterModel | null>(null);
    const [aggregateDispenses, setAggregateDispenses] = useState<AggregateDispenseModel[]>([]);

    const capacity = useMemo(() => {
        if (!currentFilter) return -1;

        const used = aggregateDispenses.reduce((acc: number, d: AggregateDispenseModel) =>
            acc + d.duration * (findDispenseOperation(d.operation_type) as DispenseOperation).factor,
            0
        );

        return currentFilter.qty - (Math.round(used / 1000 * 10) / 10);
    }, [currentFilter, aggregateDispenses]);

    const fetchData = useCallback(async () => {
        // const data = await (await fetch("/api/filters")).json();
        // setCurrentFilter(data ?? null);
        setCurrentFilter(await getCurrentFilter() ?? null);
        setAggregateDispenses(await getAggregateDispenses() ?? [])
    }, [setCurrentFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div>
            Capacità filtrante residua: {capacity} litri
        </div>
    );
}

export default FilterPanel;
