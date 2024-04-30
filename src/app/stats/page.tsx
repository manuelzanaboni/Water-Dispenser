"use server";

import Link from "next/link";

import { Button } from "@mantine/core";
import { get_items } from "@/service/db";

export default async function Settings() {
    // server side data retrieval from DB
    const items = await get_items();

    return (
        <>
            <h1>Hello, Stats Page!</h1>
            <Button component={Link} href="/">
                Home
            </Button>
            <br />
            {JSON.stringify(items, null, 2)}
        </>
    );
}
