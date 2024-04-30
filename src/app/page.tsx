"use server";

import TestGpio from "@/components/client/test-gpio";
import { Button, Stack } from "@mantine/core";
import Link from "next/link";

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
                <Button fullWidth variant="outline" component={Link} href="/test">
                    Test
                </Button>
                <TestGpio />
            </Stack>
        </>
    );
}
