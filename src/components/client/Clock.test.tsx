import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Clock from "@/components/client/Clock";

describe("Clock", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 9, 15, 14, 32, 50));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test("shows the current time once mounted", () => {
        render(<Clock />);

        expect(screen.getByText("14:32")).toBeInTheDocument();
    });

    test("moves on when the minute changes", () => {
        render(<Clock />);

        act(() => {
            vi.advanceTimersByTime(15_000);
        });

        expect(screen.getByText("14:33")).toBeInTheDocument();
    });
});
