"use client";

import { Table } from "@mantine/core";

import { RefrigeratorModel } from "@/service/types";
import { buildTimestamp } from "@/service/utils";

export default function RefrigeratorTable({ refrigeratorHistory }: { refrigeratorHistory: RefrigeratorModel[] }) {

    const rows = refrigeratorHistory.map(element => <Table.Tr key={element.ts}>
        <Table.Td>{element.temperature}</Table.Td>
        <Table.Td>{element.state}</Table.Td>
        <Table.Td>{buildTimestamp(element.ts)}</Table.Td>
    </Table.Tr>)

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Temperatura [°C]</Table.Th>
                    <Table.Th>Stato</Table.Th>
                    <Table.Th>Timestamp</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}
