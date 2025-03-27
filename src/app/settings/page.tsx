"use server";

import Link from "next/link";

import { Button } from "@mantine/core";

import ToggleTheme from "@/components/client/ToggleTheme";

export default async function Settings() {
    return (
        <>
            <h1>Hello, Settings Page!</h1>
            <Button component={Link} href="/">
                Home
            </Button>
            <br />
            <ToggleTheme />
            <br />
        </>
    );
}
