"use server";

import Link from "next/link";

import { Button, Stack } from "@mantine/core";

import DispenseActions from "@/components/client/DispenseActions";

// https://github.com/pacocoursey/next-themes
export default async function Home() {
    return (
        <>
            <h1>Hello, Home Page!</h1>
            <Stack gap="lg">
                <Button fullWidth component={Link} href="/settings">
                    Settings
                </Button>
                <Button fullWidth variant="gradient" component={Link} href="/stats">
                    Stats
                </Button>
                <DispenseActions />
            </Stack>
        </>
    );
}
