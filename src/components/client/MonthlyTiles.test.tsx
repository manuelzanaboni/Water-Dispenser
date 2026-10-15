import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import MonthlyTiles from "@/components/client/MonthlyTiles";
import { monthlySummary } from "@/service/stats";

describe("MonthlyTiles", () => {
    test("shows the litres of every water type this month", () => {
        const summary = monthlySummary([
            { operation_type: 1, duration: 0, qty: 38_400, ts: 0 },
            { operation_type: 3, duration: 0, qty: 27_600, ts: 0 },
        ]);

        render(<MonthlyTiles summary={summary} />);

        const tiles = screen.getAllByRole("listitem");
        expect(tiles).toHaveLength(3);
        expect(within(tiles[0]).getByText("Naturale · Ambiente")).toBeInTheDocument();
        expect(within(tiles[0]).getByText("38,4")).toBeInTheDocument();
        expect(tiles[0]).toHaveTextContent("Naturale · Ambiente 38,4 litri");
        expect(within(tiles[1]).getByText("0,0")).toBeInTheDocument();
        expect(within(tiles[2]).getByText("27,6")).toBeInTheDocument();
    });

    test("describes each share for assistive technologies", () => {
        const summary = monthlySummary([
            { operation_type: 1, duration: 0, qty: 250, ts: 0 },
            { operation_type: 2, duration: 0, qty: 750, ts: 0 },
        ]);

        render(<MonthlyTiles summary={summary} />);

        expect(screen.getByRole("img", { name: "75% del mese" })).toBeInTheDocument();
    });
});
