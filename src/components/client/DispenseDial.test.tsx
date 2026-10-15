import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import DispenseDial from "@/components/client/DispenseDial";
import { DISPENSE_OPERATIONS, SPARKLING_OPERATION } from "@/service/utils";

const STILL_ROOM = DISPENSE_OPERATIONS[0];

describe("DispenseDial", () => {
    test("invites to start while idle", () => {
        render(<DispenseDial operation={STILL_ROOM} elapsedSec={null} isDisabled={false} onToggle={() => { }} />);

        const dial = screen.getByRole("button", { name: "Avvia erogazione Naturale Ambiente" });
        expect(dial).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByText("Tocca per erogare")).toBeInTheDocument();
        expect(screen.getByText("Naturale · Ambiente")).toBeInTheDocument();
    });

    test("shows the running time and the estimated quantity while dispensing", () => {
        render(<DispenseDial operation={SPARKLING_OPERATION} elapsedSec={7.4} isDisabled={false} onToggle={() => { }} />);

        const dial = screen.getByRole("button", { name: "Interrompi erogazione Frizzante Fredda" });
        expect(dial).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText("0:07")).toBeInTheDocument();
        expect(screen.getByText("274 ml")).toBeInTheDocument();
        expect(screen.getByText("Tocca per fermare")).toBeInTheDocument();
    });

    test("toggles when tapped", async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        render(<DispenseDial operation={STILL_ROOM} elapsedSec={null} isDisabled={false} onToggle={onToggle} />);

        await user.click(screen.getByRole("button"));

        expect(onToggle).toHaveBeenCalledOnce();
    });

    test("ignores taps while disabled", async () => {
        const user = userEvent.setup();
        const onToggle = vi.fn();
        render(<DispenseDial operation={STILL_ROOM} elapsedSec={null} isDisabled onToggle={onToggle} />);

        await user.click(screen.getByRole("button"));

        expect(onToggle).not.toHaveBeenCalled();
    });
});
