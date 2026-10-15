import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import FridgeChip from "@/components/client/shell/FridgeChip";

const mockFetch = (response: Partial<Response>) =>
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, ...response }));

describe("FridgeChip", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    test("is disabled and never polls when temperature reading is off", () => {
        const fetchSpy = vi.fn();
        vi.stubGlobal("fetch", fetchSpy);

        render(<FridgeChip isEnabled={false} />);

        expect(screen.getByText("Frigo").closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
        expect(screen.getByText("—")).toBeInTheDocument();
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    test("shows the latest reading when temperature reading is on", async () => {
        mockFetch({ json: async () => [{ id: 1, ts: 0, temperature: 4.23, state: 1 }] });

        render(<FridgeChip isEnabled />);

        expect(await screen.findByText("4,2°")).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith("/api/refrigerators?limit=1", expect.anything());
    });

    test("falls back to a dash when the reading cannot be fetched", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });
        mockFetch({ ok: false, status: 500 });

        render(<FridgeChip isEnabled />);

        expect(await screen.findByText("—")).toBeInTheDocument();
        expect(console.error).toHaveBeenCalled();
    });

    test("falls back to a dash when the API returns no readings", async () => {
        mockFetch({ json: async () => null });

        render(<FridgeChip isEnabled />);

        expect(await screen.findByText("—")).toBeInTheDocument();
    });
});
