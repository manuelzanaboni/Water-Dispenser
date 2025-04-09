"use server";

import { getDispenses, getRefrigeratorHistory } from "@/service/db";

import DispenseTable from "@/components/client/DispenseTable";
import RefrigeratorTable from "@/components/client/RefrigeratorTable";
import SidePageHeader from "@/components/client/SidePageHeader";

export default async function Stats() {
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
