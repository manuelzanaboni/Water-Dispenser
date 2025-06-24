"use client";

import { useCallback, useEffect, useState } from "react";

import { getCurrentFilter } from "@/service/db";
import { FilterModel } from "@/service/types";

const FilterPanel = () => {
    const [currentFilter, setCurrentFilter] = useState<FilterModel | null>(null);

    const fetchCurrentFilter = useCallback(async () => {
        // const data = await (await fetch("/api/filters")).json();
        // setCurrentFilter(data ?? null);
        setCurrentFilter(await getCurrentFilter());
    }, [setCurrentFilter]);

    useEffect(() => {
        fetchCurrentFilter();
    }, [fetchCurrentFilter]);

    return (
        <div>
            Capacità filtrante residua: {currentFilter?.qty} litri
        </div>
    );
}

export default FilterPanel;
