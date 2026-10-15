import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { DispenseLockProvider, useDispenseLock } from "@/components/client/shell/DispenseLock";
import Dispenser from "@/components/client/dispenser/Dispenser";
import { insertDispense } from "@/service/db";
import { turnOFF, turnON } from "@/service/gpio";
import { DISPENSE_OPERATIONS, SPARKLING_OPERATION } from "@/service/utils";

vi.mock("@/service/gpio", () => ({ turnON: vi.fn(), turnOFF: vi.fn() }));
vi.mock("@/service/db", () => ({ insertDispense: vi.fn() }));

/* past the 1s guard against double taps on the dial */
const DEBOUNCE_PASSED_MS = 1_100;

const LockProbe = () => <span>{useDispenseLock().isLocked ? "navigazione bloccata" : "navigazione libera"}</span>;

const renderDispenser = () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
        <DispenseLockProvider>
            <Dispenser />
            <LockProbe />
        </DispenseLockProvider>
    );
    return user;
};

const dial = () => screen.getByRole("button", { name: /erogazione/ });

const wait = (ms: number) => act(() => {
    vi.advanceTimersByTime(ms);
});

describe("Dispenser", () => {
    beforeEach(() => {
        // shouldAdvanceTime keeps userEvent's own internal delays moving
        vi.useFakeTimers({ shouldAdvanceTime: true });
        vi.mocked(turnON).mockResolvedValue("");
        vi.mocked(turnOFF).mockResolvedValue("");
        vi.mocked(insertDispense).mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
    });

    test("opens the valve of the selected water type", async () => {
        const user = renderDispenser();

        await user.click(screen.getByRole("button", { name: "Frizzante Fredda" }));
        await user.click(dial());

        expect(turnON).toHaveBeenCalledWith(SPARKLING_OPERATION);
        expect(dial()).toHaveAttribute("aria-pressed", "true");
    });

    test("locks the navigation until the valve closes", async () => {
        const user = renderDispenser();

        await user.click(dial());
        expect(screen.getByText("navigazione bloccata")).toBeInTheDocument();

        await wait(DEBOUNCE_PASSED_MS);
        await user.click(dial());
        expect(screen.getByText("navigazione libera")).toBeInTheDocument();
    });

    test("counts the time while the valve is open", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await wait(7_000);

        expect(screen.getByText("0:07")).toBeInTheDocument();
    });

    test("closes the valve and records how long it was open", async () => {
        const user = renderDispenser();

        await user.click(screen.getByRole("button", { name: "Frizzante Fredda" }));
        await user.click(dial());
        await wait(7_000);
        await user.click(dial());

        expect(turnOFF).toHaveBeenCalledWith(SPARKLING_OPERATION);
        expect(insertDispense).toHaveBeenCalledWith(SPARKLING_OPERATION, 7);
        expect(dial()).toHaveAttribute("aria-pressed", "false");
    });

    test("sums up the last dispense once the valve closes", async () => {
        const user = renderDispenser();

        await user.click(screen.getByRole("button", { name: "Frizzante Fredda" }));
        await user.click(dial());
        await wait(7_000);
        await user.click(dial());

        expect(screen.getByRole("status")).toHaveTextContent("Erogati 259 ml · Frizzante · Fredda");
    });

    test("hides the summary again after a few seconds", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await wait(DEBOUNCE_PASSED_MS);
        await user.click(dial());
        expect(screen.getByRole("status")).toBeInTheDocument();

        await wait(4_000);
        expect(screen.getByRole("status")).toBeInTheDocument();

        await wait(1_100);
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
        expect(screen.getByText("Scegli l’acqua, poi tocca il cerchio")).toBeInTheDocument();
    });

    test("clears the summary when another water type is picked", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await wait(DEBOUNCE_PASSED_MS);
        await user.click(dial());
        await user.click(screen.getByRole("button", { name: "Naturale Fredda" }));

        expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    test("tells that the valve closes on its own while water runs", async () => {
        const user = renderDispenser();

        await user.click(dial());

        expect(screen.getByText("Il rubinetto si chiude da solo dopo 120 s")).toBeInTheDocument();
    });

    test("closes the valve on its own after 120 seconds", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await wait(120_500);

        expect(turnOFF).toHaveBeenCalledOnce();
        expect(insertDispense).toHaveBeenCalledWith(DISPENSE_OPERATIONS[0], 120);
        expect(dial()).toHaveAttribute("aria-pressed", "false");
        expect(screen.getByText("navigazione libera")).toBeInTheDocument();
    });

    test("does not close the valve early", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await wait(119_000);

        expect(turnOFF).not.toHaveBeenCalled();
        expect(dial()).toHaveAttribute("aria-pressed", "true");
    });

    test("ignores a second tap right after starting", async () => {
        const user = renderDispenser();

        await user.click(dial());
        await user.click(dial());

        expect(turnOFF).not.toHaveBeenCalled();
        expect(dial()).toHaveAttribute("aria-pressed", "true");
    });

    test("keeps the water type fixed while water runs", async () => {
        const user = renderDispenser();

        await user.click(dial());

        expect(screen.getByRole("button", { name: "Frizzante Fredda" })).toBeDisabled();
    });

    test("keeps working when the dispense cannot be saved", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });
        vi.mocked(insertDispense).mockRejectedValue(new Error("SQLITE_BUSY"));
        const user = renderDispenser();

        await user.click(dial());
        await wait(3_000);
        await user.click(dial());

        expect(console.error).toHaveBeenCalled();
        expect(dial()).toHaveAttribute("aria-pressed", "false");
    });
});
