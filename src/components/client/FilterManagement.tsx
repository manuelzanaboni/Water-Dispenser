"use client";

import { Accordion, Center } from "@mantine/core";

import KeyPad from "@/components/client/KeyPad";
import TitledCard from "@/components/client/TitledCard";
import { IconFilterPlus } from "@tabler/icons-react";

const FilterManagement = () => {

    const handleNewFilter = (capacity: number) => {
        // ToDo
        const promise = new Promise<number>((resolve, reject) => {
            setTimeout(() => {
                console.log(capacity)
                resolve(capacity);
            }, 300);
        });
        return promise;
    }

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
