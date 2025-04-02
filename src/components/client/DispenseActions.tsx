"use client";

import { Children, useState, useTransition } from "react";

import { Button, Group } from "@mantine/core";

import { insertDispense } from "@/service/db";
import { turnOFF, turnON } from "@/service/gpio";
import { DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";


export default function DispenseActions() {
    const [output, setOutput] = useState("");
    const [isPending, startTransition] = useTransition();

    // https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations#non-form-elements
    // const handleRead = (gpio: number) =>
    //     startTransition(async () => {
    //         const data = await gpio_read_action(gpio);
    //         setOutput(data);
    //     });

    const handleOperation = (op: DispenseOperation) => {
        startTransition(async () => {
            let data = await turnON(op);
            setOutput(data);

            data = await new Promise((resolve, reject) =>
                // setTimeout(resolve,
                //     3000,
                //     turnOFF(op)
                // )

                setTimeout(() =>
                    Promise.all([turnOFF(op), insertDispense(op, 42)])
                        .then(([relayOp, _dbOP]) => resolve(relayOp))
                        .catch(reject),
                    3000
                )
            );
            setOutput(data);
        });
    }

    return (
        <>
            <Group>
                {Children.toArray(
                    Object.values(DISPENSE_OPERATIONS).map(op =>
                        <Button key={op.type} loading={isPending} onClick={() => handleOperation(op)}>
                            {op.name}
                        </Button>
                    )
                )}
            </Group>

            {`Output: ${output}`}
        </>
    );
}
