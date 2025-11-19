"use client";

import { useState } from "react";

import { Button, Center, Group, Paper, SimpleGrid, Stack, Text } from "@mantine/core";
import { IconFilterPlus } from "@tabler/icons-react";

const NUMBERS = new Array<string>(9)
    .fill("")
    .map((_v, i) => (i + 1).toString());


type KeyPadProps = {
    uom: string,
    submitLabel: string,
    onSubmit: (value: number) => Promise<void>;
}

export default function KeyPad({ uom, submitLabel, onSubmit }: KeyPadProps) {

    const [value, setValue] = useState<string>("0");

    const handleButton = (buttonValue: string) => {
        if (value === "0") {
            if (buttonValue !== "C")
                setValue(buttonValue);
        } else {
            if (buttonValue !== "C")
                setValue(prev => prev + buttonValue);
            else
                setValue(prev => {
                    const array = prev.split("");
                    array.pop();
                    return array.length === 0 ? "0" : array.join("");
                });
        }
    }

    const KeyPadButton = ({ content, color }: { content: string, color?: string }) =>
        <Button
            size="xl"
            variant="light"
            color={color}
            onClick={() => handleButton(content)}
        >
            {content}
        </Button>;

    const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        onSubmit(parseInt(value))
            .finally(() => setValue("0"));
    }

    return (
        <Paper shadow="md" radius="md" withBorder p="xl">
            <Stack>
                <Center>
                    <Group gap="xs">
                        <Text size="xl" fw={700}>{value}</Text>
                        <Text size="xl">{uom}</Text>
                    </Group>
                </Center>

                <SimpleGrid cols={3}>
                    {NUMBERS.map(num =>
                        <KeyPadButton key={num} content={num} />
                    )}
                    <div></div>
                    <KeyPadButton key={"0"} content={"0"} />
                    <KeyPadButton key={"C"} content={"C"} color="red" />
                </SimpleGrid>

                <Button
                    size="xl"
                    leftSection={<IconFilterPlus size={30} />}
                    variant="filled"
                    color="green"
                    onClick={handleSubmit}
                >
                    {submitLabel}
                </Button>
            </Stack>
        </Paper>
    );
}
