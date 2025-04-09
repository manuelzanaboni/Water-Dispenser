"use server";

import { connection } from "next/server";

import Dispenser from "@/components/client/Dispenser";
import { getLastFilterCapacity } from "@/service/db";

// https://github.com/pacocoursey/next-themes
export default async function Home() {
    // dynamic rendering
    await connection();
    // server side data retrieval from DB
    const filterCapacity: number = await getLastFilterCapacity();

    return (
        <Dispenser filterCapacity={filterCapacity} />
    );
}
