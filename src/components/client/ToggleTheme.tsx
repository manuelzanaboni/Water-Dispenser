"use client";

import { Button, Group, useMantineColorScheme } from "@mantine/core";

export default function ToggleTheme() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    return (
        <Group>
            <Button onClick={() => setColorScheme("light")} size="xl">Light</Button>
            <Button onClick={() => setColorScheme("dark")} size="xl">Dark</Button>
        </Group>
    );
}
