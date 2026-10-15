import { describe, expect, test } from "vitest";

import { formatDate, formatLitres, formatMonth, monthlySummary } from "@/service/stats";
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

    test("dates are day/month/year with leading zeros", () => {
        expect(formatDate(new Date(2026, 8, 2).getTime() / 1000)).toBe("02/09/2026");
    });

    test("the month reads as a capitalised Italian name and the year", () => {
        expect(formatMonth(new Date(2026, 9, 15))).toBe("Ottobre 2026");
    });
});
