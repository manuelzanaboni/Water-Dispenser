"use server";

import { Group, Stack, Text, Title } from "@mantine/core";

import FilterManagement from "@/components/client/FilterManagement";
import FullScreen from "@/components/client/FullScreen";
import TankManagement from "@/components/client/TankManagement";
import ToggleTheme from "@/components/client/ToggleTheme";

import nextConfig from "../../../next.config";

export default async function Settings() {
    return (
        <>
            <Title order={1} mb="md">Impostazioni</Title>

            <Stack gap="md" align="stretch">
                <ToggleTheme />
                <FullScreen />
                <FilterManagement />
                <TankManagement />
                {/* Version */}
                <Group gap="xs">
                    <Text>Version:</Text>
                    <Text fw={700}>{nextConfig?.publicRuntimeConfig?.version}</Text>
                </Group>
            </Stack>
        </>
    );
}
