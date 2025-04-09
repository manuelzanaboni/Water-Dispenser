"use server";

import { connection } from "next/server";

import DispenseTable from "@/components/client/DispenseTable";
import RefrigeratorTable from "@/components/client/RefrigeratorTable";
import SidePageHeader from "@/components/client/SidePageHeader";
import { getDispenses, getRefrigeratorHistory } from "@/service/db";

export default async function Stats() {
    // dynamic rendering
    await connection();
    // server side data retrieval from DB
    const dispenses = await getDispenses();
    const refrigeratorHistory = await getRefrigeratorHistory();

    return (
        <>
            <SidePageHeader title="Statistiche" />
            <DispenseTable dispenses={dispenses} />
            <RefrigeratorTable refrigeratorHistory={refrigeratorHistory} />
        </>
    );
}
