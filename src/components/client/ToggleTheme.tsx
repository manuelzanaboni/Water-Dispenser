"use client";

import { Button, Group, useMantineColorScheme } from "@mantine/core";

import TitledCard from "@/components/client/TitledCard";

export default function ToggleTheme() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    return (
        <TitledCard title="Tema">
            <Group mt="md" grow>
                <Button
                    onClick={() => setColorScheme("light")}
                    variant="light"
                    size="xl"
                    radius="md"
                >
                    Chiaro
                </Button>
                <Button
                    onClick={() => setColorScheme("dark")}
                    variant="filled"
                    size="xl"
                    radius="md"
                >
                    Scuro
                </Button>
            </Group>
        </TitledCard >
    );
}
