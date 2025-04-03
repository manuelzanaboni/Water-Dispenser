"use server";

import Dispenser from "@/components/client/Dispenser";
import { getFilterCapacity } from "@/service/db";

// https://github.com/pacocoursey/next-themes
export default async function Home() {
    // server side data retrieval from DB
    const filterCapacity: number = await getFilterCapacity();

    return (
        <Dispenser filterCapacity={filterCapacity} />
    );
}
