"use server";

import { Group, Stack, Text } from "@mantine/core";

import FilterManagement from "@/components/client/FilterManagement";
import FullScreen from "@/components/client/FullScreen";
import SidePageHeader from "@/components/client/SidePageHeader";
import TankManagement from "@/components/client/TankManagement";
import ToggleTheme from "@/components/client/ToggleTheme";

import nextConfig from "../../../next.config";

export default async function Settings() {
    return (
        <>
            <SidePageHeader title="Impostazioni" />

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
