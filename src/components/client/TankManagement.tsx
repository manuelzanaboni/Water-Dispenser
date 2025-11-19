"use client";

import { Accordion, Center } from "@mantine/core";

import KeyPad from "@/components/client/KeyPad";
import TitledCard from "@/components/client/TitledCard";
import { insertTank } from "@/service/db";
import { IconFilterPlus } from "@tabler/icons-react";

const TankManagement = () => {

    const handleNewTank = (qty: number) => insertTank(qty);

    return (
        <TitledCard title="CO&#8322;" >
            <Accordion>
                <Accordion.Item value="add">
                    <Accordion.Control icon={<IconFilterPlus />}>
                        Sostituzione bombola
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Center>
                            <KeyPad uom="g" submitLabel="Aggiungi bombola" onSubmit={handleNewTank} />
                        </Center>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </TitledCard>
    );
}

export default TankManagement;
