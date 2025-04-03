"use server";

import DispenseTable from "@/components/client/DispenseTable";
import SidePageHeader from "@/components/client/SidePageHeader";
import { getDispenses } from "@/service/db";

export default async function Stats() {
    // server side data retrieval from DB
    const dispenses = await getDispenses();

    return (
        <>
            <SidePageHeader title="Statistiche" />
            <DispenseTable dispenses={dispenses} />
        </>
    );
}
