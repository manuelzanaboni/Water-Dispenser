import { afterEach, describe, expect, test, vi } from "vitest";

import {
    BUTTON_LAYOUT_ATTRIBUTE,
    BUTTON_LAYOUT_SCRIPT,
    BUTTON_LAYOUT_STORAGE_KEY,
    DEFAULT_BUTTON_LAYOUT,
    parseButtonLayout,
    readButtonLayout,
    writeButtonLayout,
} from "@/service/buttonLayout";

const brokenStorage = () => {
    throw new Error("storage unavailable");
};

describe("parseButtonLayout", () => {
    test("accepts the two known layouts", () => {
        expect(parseButtonLayout("column")).toBe("column");
        expect(parseButtonLayout("row")).toBe("row");
    });

    test("falls back to the right-hand column for anything else", () => {
        expect(DEFAULT_BUTTON_LAYOUT).toBe("column");
        expect(parseButtonLayout("grid")).toBe("column");
        expect(parseButtonLayout(null)).toBe("column");
    });
});

describe("readButtonLayout", () => {
    afterEach(() => {
        localStorage.clear();
    });

    test("returns the stored layout", () => {
        localStorage.setItem(BUTTON_LAYOUT_STORAGE_KEY, "row");

        expect(readButtonLayout(() => localStorage)).toBe("row");
    });

    test("returns the default when nothing is stored", () => {
        expect(readButtonLayout(() => localStorage)).toBe("column");
    });

    test("returns the default when the storage cannot be reached", () => {
        expect(readButtonLayout(brokenStorage)).toBe("column");
    });
});

describe("writeButtonLayout", () => {
    afterEach(() => {
        localStorage.clear();
    });

    test("stores the layout and reports success", () => {
        expect(writeButtonLayout(() => localStorage, "row")).toBe(true);
        expect(localStorage.getItem(BUTTON_LAYOUT_STORAGE_KEY)).toBe("row");
    });

    test("reports failure instead of throwing when the storage cannot be reached", () => {
        expect(writeButtonLayout(brokenStorage, "row")).toBe(false);
    });
});

describe("BUTTON_LAYOUT_SCRIPT", () => {
    const runScript = () => new Function(BUTTON_LAYOUT_SCRIPT)();
    const htmlLayout = () => document.documentElement.getAttribute(BUTTON_LAYOUT_ATTRIBUTE);

    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute(BUTTON_LAYOUT_ATTRIBUTE);
        vi.restoreAllMocks();
    });

    test("applies the stored layout to <html> before hydration", () => {
        localStorage.setItem(BUTTON_LAYOUT_STORAGE_KEY, "row");

        runScript();

        expect(htmlLayout()).toBe("row");
    });

    test("applies the default for an unknown stored value", () => {
        localStorage.setItem(BUTTON_LAYOUT_STORAGE_KEY, "sideways");

        runScript();

        expect(htmlLayout()).toBe("column");
    });

    test("applies the default when the storage throws", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(brokenStorage);

        runScript();

        expect(htmlLayout()).toBe("column");
    });
});
