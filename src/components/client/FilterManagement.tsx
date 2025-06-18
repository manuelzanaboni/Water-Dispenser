"use client";

import { Accordion, Center } from "@mantine/core";

import KeyPad from "@/components/client/KeyPad";
import TitledCard from "@/components/client/TitledCard";
import { insertFilter } from "@/service/db";
import { IconFilterPlus } from "@tabler/icons-react";

const FilterManagement = () => {

    const handleNewFilter = (qty: number) => insertFilter(qty);

    return (
        <TitledCard title="Filtraggio" >
            <Accordion>
                <Accordion.Item value="add">
                    <Accordion.Control icon={<IconFilterPlus />}>
                        Sostituzione filtro
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Center>
                            <KeyPad onSubmit={handleNewFilter} />
                        </Center>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>
        </TitledCard>
    );
}

export default FilterManagement;
