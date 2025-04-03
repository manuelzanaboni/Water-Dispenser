"use server";

import { Stack } from "@mantine/core";

import FullScreen from "@/components/client/FullScreen";
import SidePageHeader from "@/components/client/SidePageHeader";
import ToggleTheme from "@/components/client/ToggleTheme";

export default async function Settings() {
    return (
        <>
            <SidePageHeader title="Impostazioni" />

            <Stack gap="md" align="flex-start">
                <ToggleTheme />
                <FullScreen />
            </Stack>
        </>
    );
}
