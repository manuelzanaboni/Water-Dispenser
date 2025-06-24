"use server";

import { Stack } from "@mantine/core";

import DispenseSummary from "@/components/client/DispenseSummary";
import RefrigeratorChart from "@/components/client/RefrigeratorChart";
import SidePageHeader from "@/components/client/SidePageHeader";

export default async function Stats() {
    return (
        <>
            <SidePageHeader title="Statistiche" />
            <Stack gap="md">
                <DispenseSummary />
                <RefrigeratorChart />
            </Stack>
        </>
    );
}
