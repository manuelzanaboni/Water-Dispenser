"use server";

import { connection } from "next/server";

import SettingsScreen from "@/components/client/settings/SettingsScreen";
import { getCurrentFilter, getTanks } from "@/service/db";
import { loadSafely } from "@/service/loadSafely";

import nextConfig from "../../../next.config";

export default async function Settings() {
    // reads the db on every visit: the last filter and tank change from this very page
    await connection();

    const [filter, tanks] = await Promise.all([
        loadSafely("the current filter", getCurrentFilter, undefined),
        loadSafely("the CO₂ tanks", getTanks, []),
    ]);
    const lastTank = tanks.reduce<typeof tanks[number] | null>((last, tank) => (!last || tank.ts > last.ts ? tank : last), null);

    return (
        <SettingsScreen
            version={String(nextConfig?.publicRuntimeConfig?.version ?? "")}
            lastFilter={filter ? { qty: filter.qty, ts: filter.ts } : null}
            lastTank={lastTank ? { qty: lastTank.qty, ts: lastTank.ts } : null}
        />
    );
}
