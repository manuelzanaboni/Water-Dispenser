import { describe, expect, test } from "vitest";

import { DISPENSE_OPERATIONS, findDispenseOperation, formatTemperature, toThousandsRounded } from "@/service/utils";

describe("formatTemperature", () => {
    test("shows one decimal with the Italian comma and a degree sign", () => {
        expect(formatTemperature(4.23)).toBe("4,2°");
    });

    test("keeps the decimal on whole degrees", () => {
        expect(formatTemperature(5)).toBe("5,0°");
    });

    test("shows a dash when there is no reading", () => {
        expect(formatTemperature(null)).toBe("—");
    });
});

describe("findDispenseOperation", () => {
    test("returns the operation matching the given type", () => {
        expect(findDispenseOperation(3)?.name).toBe("Frizzante Fredda");
    });

    test("returns undefined for an unknown type", () => {
        expect(findDispenseOperation(99)).toBeUndefined();
    });
});

describe("DISPENSE_OPERATIONS", () => {
    test("uses the kiosk palette: sand, ice and aquamarine", () => {
        expect(DISPENSE_OPERATIONS.map(op => op.color)).toEqual(["#E3C99A", "#8FD0FA", "#36C2A3"]);
    });

    test("gives every water type its own color", () => {
        const colors = DISPENSE_OPERATIONS.map(op => op.color.toLowerCase());

        expect(new Set(colors).size).toBe(DISPENSE_OPERATIONS.length);
    });
});

describe("toThousandsRounded", () => {
    test("converts millilitres to litres with one decimal", () => {
        expect(toThousandsRounded(1234)).toBe(1.2);
    });

    test("rounds half up to the next decimal", () => {
        expect(toThousandsRounded(1250)).toBe(1.3);
    });

    test("returns zero for zero", () => {
        expect(toThousandsRounded(0)).toBe(0);
    });
});
