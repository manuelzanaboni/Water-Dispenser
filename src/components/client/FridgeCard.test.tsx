import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import FridgeCard from "@/components/client/FridgeCard";

const SERIES = { current: 4.2, min: 3.8, max: 5.1, temperatures: [4.4, 3.8, 5.1, 4.2] };

describe("FridgeCard", () => {
    test("stays on screen but says the reading is off when READ_TEMP_ENABLED is false", () => {
        render(<FridgeCard isEnabled={false} series={null} />);

        expect(screen.getByRole("region", { name: "Frigorifero" })).toBeInTheDocument();
        expect(screen.getByText("Disattivato")).toBeInTheDocument();
        expect(screen.getByText("La lettura della temperatura non è attiva su questo erogatore.")).toBeInTheDocument();
        expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    test("shows the current temperature and the last 12 hours", () => {
        render(<FridgeCard isEnabled series={SERIES} />);

        expect(screen.getByText("4,2 °C")).toBeInTheDocument();
        expect(screen.getByText("min 3,8°")).toBeInTheDocument();
        expect(screen.getByText("max 5,1°")).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Temperatura del frigorifero nelle ultime 12 ore, tra 3,8° e 5,1°" })).toBeInTheDocument();
    });

    test("says so when the sensor is on but nothing was read yet", () => {
        render(<FridgeCard isEnabled series={null} />);

        expect(screen.getByText("Nessuna lettura nelle ultime 12 ore")).toBeInTheDocument();
    });
});
