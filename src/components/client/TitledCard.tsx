"use client";
import { JSX } from "react";

import { Card, Text } from "@mantine/core";

type TitledCardProps = {
    title: string;
    children: JSX.Element
};

const TitledCard = ({ title, children }: TitledCardProps) =>
    <Card shadow="lg" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={700}>{title}</Text>
        {children}
    </Card>;

export default TitledCard;
