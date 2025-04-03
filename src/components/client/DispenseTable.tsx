"use client";

import { Table } from "@mantine/core";

import { DispenseModel } from "@/service/types";
import { findDispenseOperation } from "@/service/utils";

export default function DispenseTable({ dispenses }: { dispenses: DispenseModel[] }) {

    const rows = dispenses.map(element => <Table.Tr key={element.id}>
        <Table.Td>{element.id}</Table.Td>
        <Table.Td>{findDispenseOperation(element.operation_type)?.name}</Table.Td>
        <Table.Td>{element.duration}</Table.Td>
        <Table.Td>{element.qty}</Table.Td>
        <Table.Td>{`${new Date(element.ts * 1000).toLocaleDateString()} ${new Date(element.ts * 1000).toLocaleTimeString()}`}</Table.Td>
    </Table.Tr>)

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>ID</Table.Th>
                    <Table.Th>Tipo</Table.Th>
                    <Table.Th>Durata [s]</Table.Th>
                    <Table.Th>Quantità [L]</Table.Th>
                    <Table.Th>Timestamp</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}
