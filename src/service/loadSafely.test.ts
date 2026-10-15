import { afterEach, describe, expect, test, vi } from "vitest";

import { loadSafely } from "@/service/loadSafely";

describe("loadSafely", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("returns what the loader returns", async () => {
        expect(await loadSafely("tanks", async () => [1, 2], [])).toEqual([1, 2]);
    });

    test("logs the failure and returns the fallback instead of throwing", async () => {
        const log = vi.spyOn(console, "error").mockImplementation(() => { });

        const result = await loadSafely("tanks", async () => { throw new Error("SQLITE_BUSY"); }, []);

        expect(result).toEqual([]);
        expect(log).toHaveBeenCalledWith("Could not load tanks", expect.any(Error));
    });
});
