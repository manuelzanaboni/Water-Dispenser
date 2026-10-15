import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import FilterGauge from "@/components/client/FilterGauge";
import { FilterStatus } from "@/service/stats";

const STATUS: FilterStatus = {
    capacityLitres: 1500,
    remainingLitres: 1188,
    remainingRatio: 0.792,
    isLow: false,
    since: new Date(2026, 8, 2).getTime() / 1000,
};

describe("FilterGauge", () => {
    test("shows the litres left, the capacity and the install date", () => {
        render(<FilterGauge status={STATUS} />);

        expect(screen.getByText("1.188")).toBeInTheDocument();
        expect(screen.getByText("Dal 02/09/2026")).toBeInTheDocument();
        expect(screen.getByText("su 1.500 l")).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Filtro" })).toHaveTextContent("1.188 litri residui Dal 02/09/2026 su 1.500 l");
        expect(screen.getByRole("img", { name: "Filtro: 79% di capacità residua" })).toBeInTheDocument();
    });

    test("warns when the filter is almost used up", () => {
        render(<FilterGauge status={{ ...STATUS, remainingLitres: 90, remainingRatio: 0.06, isLow: true }} />);

        expect(screen.getByText("Da sostituire presto")).toBeInTheDocument();
    });

    test("points to the settings when no filter was registered", () => {
        render(<FilterGauge status={null} />);

        expect(screen.getByText("Nessun filtro registrato")).toBeInTheDocument();
        expect(screen.getByText("Registralo in Impostazioni")).toBeInTheDocument();
    });
});
