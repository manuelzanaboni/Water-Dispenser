"use server";

import { Stack } from "@mantine/core";

import MonthlyDispenseSummary from "@/components/client/MonthlyDispenseSummary";
import RefrigeratorChart from "@/components/client/RefrigeratorChart";
import SidePageHeader from "@/components/client/SidePageHeader";
import TankDispenseSummary from "@/components/client/TankDispenseSummary";

export default async function Stats() {
    return (
        <>
            <SidePageHeader title="Statistiche" />
            <Stack gap="md">
                <MonthlyDispenseSummary />
                <TankDispenseSummary />
                <RefrigeratorChart />
            </Stack>
        </>
    );
}
