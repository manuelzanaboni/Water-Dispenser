"use client";

import { Table } from "@mantine/core";

import { DispenseModel } from "@/service/types";
import { findDispenseOperation } from "@/service/utils";

const buildTimestamp = (ts: number) => `${new Date(ts * 1000).toLocaleString("it-IT")}`;

export default function DispenseTable({ dispenses }: { dispenses: DispenseModel[] }) {

    const rows = dispenses.map(element => <Table.Tr key={element.id}>
        <Table.Td>{element.id}</Table.Td>
        <Table.Td>{findDispenseOperation(element.operation_type)?.name}</Table.Td>
        <Table.Td>{element.duration}</Table.Td>
        <Table.Td>{element.qty}</Table.Td>
        <Table.Td>{buildTimestamp(element.ts)}</Table.Td>
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
