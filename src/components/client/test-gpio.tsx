"use client";

import { useState, useTransition } from "react";

import { Button, Group } from "@mantine/core";

import { gpio_read_action, gpio_write_action } from "@/service/actions";
import { GPIO_STATE } from "@/service/globals";

export default function TestGpio() {
    const [output, setOutput] = useState("");
    const [isPending, startTransition] = useTransition();

    // https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
    const handleRead = (gpio: number) =>
        startTransition(async () => {
            const data = await gpio_read_action(gpio);
            setOutput(data);
        });

    const handleWrite = (gpio: number, state: GPIO_STATE) =>
        startTransition(async () => {
            const data = await gpio_write_action(gpio, state);
            setOutput(data);
        });

    return (
        <>
            <Group>
                <Button loading={isPending} onClick={() => handleRead(2)}>
                    Read
                </Button>
                <Button loading={isPending} onClick={() => handleWrite(2, GPIO_STATE.LOW)}>
                    Write LOW
                </Button>
                <Button loading={isPending} onClick={() => handleWrite(2, GPIO_STATE.HIGH)}>
                    Write HIGH
                </Button>
            </Group>
            {`Output: ${output}`}
        </>
    );
}
