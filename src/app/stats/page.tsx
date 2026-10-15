"use server";

import { Stack, Title } from "@mantine/core";

import FilterSummary from "@/components/client/FilterSummary";
import MonthlyDispenseSummary from "@/components/client/MonthlyDispenseSummary";
import RefrigeratorChart from "@/components/client/RefrigeratorChart";
import TankDispenseSummary from "@/components/client/TankDispenseSummary";

export default async function Stats() {
    return (
        <>
            <Title order={1} mb="md">Statistiche</Title>
            <Stack gap="md">
                <MonthlyDispenseSummary />
                <FilterSummary />
                <TankDispenseSummary />
                <RefrigeratorChart />
            </Stack>
        </>
    );
}
