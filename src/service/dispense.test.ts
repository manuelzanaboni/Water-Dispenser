import { describe, expect, test } from "vitest";

import { estimateMl, formatElapsed, splitOperationName, waterLevelOffset } from "@/service/dispense";

describe("formatElapsed", () => {
    test("shows minutes and zero padded seconds", () => {
        expect(formatElapsed(7.8)).toBe("0:07");
        expect(formatElapsed(65)).toBe("1:05");
    });

    test("never shows a negative time", () => {
        expect(formatElapsed(-3)).toBe("0:00");
    });
});

describe("estimateMl", () => {
    test("multiplies the elapsed time by the flow rate", () => {
        expect(estimateMl(7, 37)).toBe(259);
    });

    test("rounds to whole millilitres", () => {
        expect(estimateMl(1.25, 32)).toBe(40);
    });

    test("is zero before any water ran", () => {
        expect(estimateMl(-1, 32)).toBe(0);
    });
});

describe("waterLevelOffset", () => {
    test("keeps a little water at the bottom while idle", () => {
        expect(waterLevelOffset(null)).toBe(86);
    });

    test("starts rising from the idle level", () => {
        expect(waterLevelOffset(0)).toBe(86);
        expect(waterLevelOffset(6)).toBe(46);
    });

    test("stops rising once the glass looks full", () => {
        expect(waterLevelOffset(12)).toBe(6);
        expect(waterLevelOffset(60)).toBe(6);
    });
});

describe("splitOperationName", () => {
    test("splits the water type from its temperature", () => {
        expect(splitOperationName("Naturale Ambiente")).toEqual({ title: "Naturale", subtitle: "Ambiente" });
    });

    test("keeps every word after the first in the subtitle", () => {
        expect(splitOperationName("Frizzante Molto Fredda")).toEqual({ title: "Frizzante", subtitle: "Molto Fredda" });
    });
});
