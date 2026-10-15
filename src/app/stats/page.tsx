"use server";

import { connection } from "next/server";

import FilterGauge from "@/components/client/FilterGauge";
import MonthlyTiles from "@/components/client/MonthlyTiles";
import FridgeCard from "@/components/client/FridgeCard";
import TankCard from "@/components/client/TankCard";

import styles from "@/app/stats/page.module.css";
import {
    getAggregateDispensesForFilter,
    getAggregateDispensesForTank,
    getCurrentFilter,
    getDispenses,
    getRefrigerators,
    getTanks,
} from "@/service/db";
import { loadSafely } from "@/service/loadSafely";
import {
    filterStatus,
    formatLitres,
    formatMonth,
    fridgeReadingsLimit,
    fridgeSeries,
    monthlySummary,
    tankPeriods,
} from "@/service/stats";

export default async function Stats() {
    // live data and the container's env: never prerender this page at build time
    await connection();

    const nowTs = Math.floor(Date.now() / 1000);
    const isTemperatureEnabled = process.env.READ_TEMP_ENABLED === "true";
    const readingsLimit = fridgeReadingsLimit(Number(process.env.READ_TEMP_DELTA_SEC));

    const [dispenses, filter, filterUsage, tanks, sparklingDays, readings] = await Promise.all([
        loadSafely("this month's dispenses", getDispenses, []),
        loadSafely("the current filter", getCurrentFilter, undefined),
        loadSafely("the filter usage", getAggregateDispensesForFilter, []),
        loadSafely("the CO₂ tanks", getTanks, []),
        // every sparkling day ever: tankPeriods splits them between the tanks
        loadSafely("the sparkling water per day", () => getAggregateDispensesForTank(0, nowTs), []),
        // nothing to read while the sensor loop is off
        isTemperatureEnabled
            ? loadSafely("the fridge readings", () => getRefrigerators(readingsLimit), [])
            : Promise.resolve([]),
    ]);
    const summary = monthlySummary(dispenses);

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1 className={styles.title}>Statistiche</h1>
                <span className={styles.period}>
                    {formatMonth(new Date())} · {formatLitres(summary.totalLitres)} litri
                </span>
            </header>

            <MonthlyTiles summary={summary} />

            <div className={styles.cards}>
                <FilterGauge status={filterStatus(filter, filterUsage)} />
                <TankCard periods={tankPeriods(tanks, sparklingDays, nowTs)} />
                <FridgeCard isEnabled={isTemperatureEnabled} series={fridgeSeries(readings)} />
            </div>
        </div>
    );
}
