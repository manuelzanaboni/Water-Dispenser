"use server";

import Link from "next/link";

import { Button } from '@mantine/core';

import DispenseTable from "@/components/client/DispenseTable";
import { getDispenses } from "@/service/db";

export default async function Stats() {
    // server side data retrieval from DB
    const dispenses = await getDispenses();

    return (
        <>
            <h1>Hello, Stats Page!</h1>
            <Button component={Link} href="/">
                Home
            </Button>
            <DispenseTable dispenses={dispenses} />
        </>
    );
}
