import { describe, expect, test } from "vitest";

import {
    filterStatus,
    formatDate,
    formatInteger,
    formatLitres,
    formatMonth,
    fridgeReadingsLimit,
    fridgeSeries,
    monthlySummary,
    tankPeriods,
} from "@/service/stats";

describe("tankPeriods", () => {
    const DAY = 86_400;
    const ts = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 1000;
    const NOW = ts("2026-10-15");

    const tanks = [
        { id: 4, qty: 600, ts: ts("2026-10-10") },
        { id: 3, qty: 600, ts: ts("2026-09-01") },
    ];
    // sparkling seconds per day, as the aggregate_dispenses_tanks view returns them
    const days = [
        { day: "2026-09-20", duration: 100 },
        { day: "2026-10-12", duration: 200 },
        { day: "2026-10-15", duration: 50 },
    ];

    test("orders the tanks from the oldest to the one in use", () => {
        const periods = tankPeriods(tanks, days, NOW);

        expect(periods.map(p => p.id)).toEqual([3, 4]);
        expect(periods[0].to).toBe(tanks[0].ts);
        expect(periods[1].to).toBeNull();
    });

    test("sums the sparkling water poured from each tank", () => {
        const [older, current] = tankPeriods(tanks, days, NOW);

        // 100s × 37 ml/s
        expect(older.litres).toBe(3.7);
        // (200 + 50)s × 37 ml/s
        expect(current.litres).toBe(9.3);
    });

    test("gives fourteen daily bars ending today for the tank in use", () => {
        const current = tankPeriods(tanks, days, NOW)[1];

        expect(current.bars).toHaveLength(14);
        expect(current.bars.at(-1)).toEqual({ day: "2026-10-15", litres: 1.9 });
        expect(current.bars.at(-4)).toEqual({ day: "2026-10-12", litres: 7.4 });
        expect(current.bars[0].day).toBe("2026-10-02");
    });

    test("ends the bars of a replaced tank on the day it was replaced", () => {
        const older = tankPeriods(tanks, days, NOW)[0];

        expect(older.bars.at(-1)?.day).toBe("2026-10-10");
    });

    test("is empty when no tank was ever registered", () => {
        expect(tankPeriods([], days, NOW + DAY)).toEqual([]);
    });
});

describe("fridge readings", () => {
    test("asks for twelve hours worth of readings at the configured interval", () => {
        expect(fridgeReadingsLimit(120)).toBe(360);
        expect(fridgeReadingsLimit(5)).toBe(8640);
    });

    test("falls back to the production interval for a missing or broken setting", () => {
        expect(fridgeReadingsLimit(undefined)).toBe(360);
        expect(fridgeReadingsLimit(Number.NaN)).toBe(360);
        expect(fridgeReadingsLimit(0)).toBe(360);
    });

    test("orders the readings in time and keeps the latest as current", () => {
        const series = fridgeSeries([
            { ts: 30, temperature: 4.2, state: 1 },
            { ts: 10, temperature: 3.8, state: 1 },
            { ts: 20, temperature: 5.1, state: 0 },
        ]);

        expect(series).toEqual({ current: 4.2, min: 3.8, max: 5.1, temperatures: [3.8, 5.1, 4.2] });
    });

    test("skips readings the sensor could not take", () => {
        const series = fridgeSeries([
            { ts: 10, temperature: null, state: 0 },
            { ts: 20, temperature: 4, state: 1 },
        ]);

        expect(series?.temperatures).toEqual([4]);
    });

    test("is empty without any valid reading", () => {
        expect(fridgeSeries([{ ts: 10, temperature: null, state: 0 }])).toBeNull();
    });
});

describe("filterStatus", () => {
    const filter = { id: 4, qty: 1500, ts: 1_788_000_000 };

    test("is empty until a filter has been registered", () => {
        expect(filterStatus(undefined, [])).toBeNull();
    });

    test("subtracts what went through the filter since it was installed", () => {
        // 1000s still at 32 ml/s and 500s sparkling at 37 ml/s = 50.5 litres
        const status = filterStatus(filter, [
            { operation_type: 1, duration: 1000 },
            { operation_type: 3, duration: 500 },
        ]);

        expect(status).toEqual({ capacityLitres: 1500, remainingLitres: 1449.5, remainingRatio: 1449.5 / 1500, isLow: false, since: filter.ts });
    });

    test("flags the filter as low under a tenth of its capacity", () => {
        const status = filterStatus({ ...filter, qty: 100 }, [{ operation_type: 1, duration: 3000 }]);

        expect(status?.remainingLitres).toBe(4);
        expect(status?.isLow).toBe(true);
    });

    test("never goes below empty once the capacity is used up", () => {
        const status = filterStatus({ ...filter, qty: 10 }, [{ operation_type: 1, duration: 3000 }]);

        expect(status?.remainingLitres).toBe(0);
        expect(status?.remainingRatio).toBe(0);
    });
});
import { DispenseModel } from "@/service/types";
import { DISPENSE_OPERATIONS } from "@/service/utils";

const dispense = (operation_type: number, duration: number, qty?: number): DispenseModel =>
    ({ operation_type, duration, qty, ts: 0 });

describe("monthlySummary", () => {
    test("adds up the litres of each water type, in the catalogue order", () => {
        const summary = monthlySummary([
            dispense(1, 10, 320),
            dispense(1, 0, 180),
            dispense(3, 20, 740),
        ]);

        expect(summary.types.map(t => [t.operation.type, t.litres])).toEqual([[1, 0.5], [2, 0], [3, 0.7]]);
        expect(summary.totalLitres).toBe(1.2);
    });

    test("falls back to duration × flow when the quantity was not stored", () => {
        const summary = monthlySummary([dispense(2, 10)]);

        expect(summary.types[1].litres).toBe(0.3);
    });

    test("gives each type its share of the month", () => {
        const summary = monthlySummary([dispense(1, 0, 250), dispense(2, 0, 750)]);

        expect(summary.types.map(t => t.share)).toEqual([0.25, 0.75, 0]);
    });

    test("reports zero shares on an empty month", () => {
        const summary = monthlySummary([]);

        expect(summary.totalLitres).toBe(0);
        expect(summary.types.every(t => t.share === 0)).toBe(true);
        expect(summary.types).toHaveLength(DISPENSE_OPERATIONS.length);
    });

    test("ignores dispenses of an unknown water type", () => {
        const summary = monthlySummary([dispense(9, 10, 500)]);

        expect(summary.totalLitres).toBe(0);
    });
});

describe("formatting", () => {
    test("litres use the Italian comma and one decimal", () => {
        expect(formatLitres(38.4)).toBe("38,4");
        expect(formatLitres(2)).toBe("2,0");
    });

    test("integers group thousands with a dot, even with four digits", () => {
        expect(formatInteger(1188)).toBe("1.188");
        expect(formatInteger(1234567)).toBe("1.234.567");
        expect(formatInteger(600)).toBe("600");
        expect(formatInteger(1449.5)).toBe("1.450");
    });

    test("dates are day/month/year with leading zeros", () => {
        expect(formatDate(new Date(2026, 8, 2).getTime() / 1000)).toBe("02/09/2026");
    });

    test("the month reads as a capitalised Italian name and the year", () => {
        expect(formatMonth(new Date(2026, 9, 15))).toBe("Ottobre 2026");
    });
});
