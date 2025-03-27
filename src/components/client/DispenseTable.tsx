"use client";

import { Table } from "@mantine/core";

import { DispenseModel } from "@/service/globals";

export default function DispenseTable({ dispenses }: { dispenses: DispenseModel[] }) {

    const rows = dispenses.map(element => <Table.Tr key={element.id}>
        <Table.Td>{element.id}</Table.Td>
        <Table.Td>{element.operation_type}</Table.Td>
        <Table.Td>{element.duration}</Table.Td>
        <Table.Td>{element.qty}</Table.Td>
        <Table.Td>{element.ts}</Table.Td>
    </Table.Tr>)

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Durata</Table.Th>
                    <Table.Th>Quantità</Table.Th>
                    <Table.Th>Timestamp</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}
