"use server";

import { connection } from "next/server";

import DispenseChart from "@/components/client/DispenseChart";
import DispenseTable from "@/components/client/DispenseTable";
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
            <DispenseChart dispenses={dispenses} />
            <DispenseTable dispenses={dispenses} />
            <RefrigeratorChart />
        </>
    );
}
