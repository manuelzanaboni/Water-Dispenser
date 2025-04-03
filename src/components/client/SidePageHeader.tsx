"use client";
import Link from "next/link";

import { ActionIcon, Center, Grid, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";

type SidePageHeaderProps = {
    title: string;
}

const SidePageHeader = ({ title }: SidePageHeaderProps) => {
    return <Grid p="md" justify="space-between">
        <Grid.Col span="content">
            <Center>
                <ActionIcon variant="light" size={60} component={Link} href="/" >
                    <IconArrowLeft size={40} />
                </ActionIcon>
            </Center>
        </Grid.Col>
        <Grid.Col span={10}>
            <Center>
                <Title order={1} >{title}</Title>
            </Center>
        </Grid.Col>
        <Grid.Col span={1}>
            <Center>
            </Center>
        </Grid.Col>
    </Grid>
}

export default SidePageHeader;