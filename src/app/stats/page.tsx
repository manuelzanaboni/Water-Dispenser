"use server";

import FilterSummary from "@/components/client/FilterSummary";
import MonthlyTiles from "@/components/client/MonthlyTiles";
import RefrigeratorChart from "@/components/client/RefrigeratorChart";
import TankDispenseSummary from "@/components/client/TankDispenseSummary";

import styles from "@/app/stats/page.module.css";
import { getDispenses } from "@/service/db";
import { formatLitres, formatMonth, monthlySummary } from "@/service/stats";

/* one failing query must not take the whole screen down: log it and show empty data */
const loadSafely = async <T,>(what: string, load: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await load();
    } catch (error) {
        console.error(`Stats: could not load ${what}`, error);
        return fallback;
    }
};

export default async function Stats() {
    const dispenses = await loadSafely("this month's dispenses", getDispenses, []);
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
                <FilterSummary />
                <TankDispenseSummary />
                <RefrigeratorChart />
            </div>
        </div>
    );
}
