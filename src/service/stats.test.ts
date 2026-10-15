import { describe, expect, test } from "vitest";

import { filterStatus, formatDate, formatInteger, formatLitres, formatMonth, monthlySummary } from "@/service/stats";

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
