import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import TankCard from "@/components/client/stats/TankCard";
import { TankPeriod } from "@/service/stats";

const ts = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 1000;

const bars = Array.from({ length: 14 }, (_, i) => ({ day: `2026-10-${String(i + 1).padStart(2, "0")}`, litres: i % 3 }));

const PERIODS: TankPeriod[] = [
    { id: 3, qtyGrams: 600, from: ts("2026-07-18"), to: ts("2026-09-12"), litres: 104.5, bars },
    { id: 4, qtyGrams: 600, from: ts("2026-09-12"), to: null, litres: 86.4, bars },
];

describe("TankCard", () => {
    test("opens on the tank in use", () => {
        render(<TankCard periods={PERIODS} />);

        expect(screen.getByText("#4")).toBeInTheDocument();
        expect(screen.getByText("86,4")).toBeInTheDocument();
        expect(screen.getByText("In uso dal 12/09/2026")).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Bombola CO₂" })).toHaveTextContent("#4 In uso dal 12/09/2026 86,4 litri frizzante");
        expect(screen.getByRole("button", { name: "Bombola successiva" })).toBeDisabled();
    });

    test("steps back to the previous tank", async () => {
        const user = userEvent.setup();
        render(<TankCard periods={PERIODS} />);

        await user.click(screen.getByRole("button", { name: "Bombola precedente" }));

        expect(screen.getByText("#3")).toBeInTheDocument();
        expect(screen.getByText("104,5")).toBeInTheDocument();
        expect(screen.getByText("18/07/2026 → 12/09/2026")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Bombola precedente" })).toBeDisabled();
    });

    test("draws one bar per day", () => {
        render(<TankCard periods={PERIODS} />);

        expect(screen.getByRole("img", { name: /ultimi 14 giorni/ }).children).toHaveLength(14);
    });

    test("points to the settings when no tank was registered", () => {
        render(<TankCard periods={[]} />);

        expect(screen.getByText("Nessuna bombola registrata")).toBeInTheDocument();
    });
});
