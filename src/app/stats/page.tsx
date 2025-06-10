"use server";

import { connection } from "next/server";

import { Stack } from "@mantine/core";

import DispenseSummary from "@/components/client/DispenseSummary";
import RefrigeratorChart from "@/components/client/RefrigeratorChart";
import SidePageHeader from "@/components/client/SidePageHeader";
import { getDispenses } from "@/service/db";

export default async function Stats() {
    // dynamic rendering
    await connection();
    // server side data retrieval from DB
    const dispenses = await getDispenses();

    return (
        <>
            <SidePageHeader title="Statistiche" />
            <Stack gap="md">
                <DispenseSummary dispenses={dispenses} />
                <RefrigeratorChart />
            </Stack>
        </>
    );
}
