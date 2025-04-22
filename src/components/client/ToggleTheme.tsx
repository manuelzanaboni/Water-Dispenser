"use client";

import { Button, Card, Group, Text, useMantineColorScheme } from "@mantine/core";

export default function ToggleTheme() {
    const { colorScheme, setColorScheme } = useMantineColorScheme();

    return (
        <Card shadow="lg" padding="lg" radius="md" withBorder>
            <Text size="lg" fw={700}>Tema</Text>

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
        </Card>
    );
}
