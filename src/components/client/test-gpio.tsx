"use client";

import { Children, useState, useTransition } from "react";

import { Button, Group, Stack } from "@mantine/core";

import { gpio_write_action } from "@/service/actions";
import { GPIO_STATE, RELAYS } from "@/service/globals";

export default function TestGpio() {
    const [output, setOutput] = useState("");
    const [isPending, startTransition] = useTransition();

    // https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
    // const handleRead = (gpio: number) =>
    //     startTransition(async () => {
    //         const data = await gpio_read_action(gpio);
    //         setOutput(data);
    //     });

    const handleWrite = (gpio: number, state: GPIO_STATE) =>
        startTransition(async () => {
            const data = await gpio_write_action(gpio, state);
            setOutput(data);
        });

    return (
        <>
            {/* <Button loading={isPending} onClick={() => handleRead(2)}>
                Read
            </Button> */}

            <Stack gap="md">
                {Children.toArray(
                    Object.values(RELAYS).map(relay =>
                        <Group>
                            <Button loading={isPending} onClick={() => handleWrite(relay, GPIO_STATE.LOW)}>
                                {relay}: Write LOW
                            </Button>
                            <Button loading={isPending} onClick={() => handleWrite(relay, GPIO_STATE.HIGH)}>
                                {relay}: Write HIGH
                            </Button>
                        </Group>
                    )
                )}

                <Button key="touch" onTouchEnd={() => setOutput("TOUCH")}>
                    TOUCH
                </Button>

            </Stack>

            {`Output: ${output}`}
        </>
    );
}
