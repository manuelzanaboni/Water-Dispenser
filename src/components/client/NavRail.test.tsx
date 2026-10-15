import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { DispenseLockProvider, useDispenseLock } from "@/components/client/DispenseLock";
import NavRail from "@/components/client/NavRail";

vi.mock("next/navigation", () => ({ usePathname: vi.fn() }));

const mockPathname = (pathname: string) => vi.mocked(usePathname).mockReturnValue(pathname);

describe("NavRail", () => {
    beforeEach(() => {
        mockPathname("/");
    });

    test("links to the dispenser, stats and settings screens", () => {
        render(<NavRail />);

        expect(screen.getByRole("link", { name: "Eroga" })).toHaveAttribute("href", "/");
        expect(screen.getByRole("link", { name: "Statistiche" })).toHaveAttribute("href", "/stats");
        expect(screen.getByRole("link", { name: "Impostazioni" })).toHaveAttribute("href", "/settings");
    });

    test("marks only the dispenser as current on the home route", () => {
        render(<NavRail />);

        expect(screen.getByRole("link", { name: "Eroga" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", { name: "Statistiche" })).not.toHaveAttribute("aria-current");
    });

    test("marks the stats link as current on the stats route", () => {
        mockPathname("/stats");

        render(<NavRail />);

        expect(screen.getByRole("link", { name: "Statistiche" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("link", { name: "Eroga" })).not.toHaveAttribute("aria-current");
    });
});

/* stands in for the dispenser: toggles the lock the way a running valve does */
const ValveSwitch = () => {
    const { isLocked, setLocked } = useDispenseLock();

    return <button type="button" onClick={() => setLocked(!isLocked)}>valvola</button>;
};

const renderWithLock = () => render(
    <DispenseLockProvider>
        <NavRail />
        <ValveSwitch />
    </DispenseLockProvider>
);

describe("NavRail while dispensing", () => {
    beforeEach(() => {
        mockPathname("/");
    });

    test("keeps every destination enabled while no water is running", () => {
        renderWithLock();

        expect(screen.getByRole("link", { name: "Statistiche" })).not.toHaveAttribute("aria-disabled");
        expect(screen.queryByText("Bloccato durante l’erogazione")).not.toBeInTheDocument();
    });

    test("disables every destination and explains why while water is running", async () => {
        const user = userEvent.setup();
        renderWithLock();

        await user.click(screen.getByRole("button", { name: "valvola" }));

        for (const name of ["Eroga", "Statistiche", "Impostazioni"]) {
            expect(screen.getByRole("link", { name })).toHaveAttribute("aria-disabled", "true");
        }
        expect(screen.getByText("Bloccato durante l’erogazione")).toBeInTheDocument();
    });

    test("enables the destinations again once the valve closes", async () => {
        const user = userEvent.setup();
        renderWithLock();

        await user.click(screen.getByRole("button", { name: "valvola" }));
        await user.click(screen.getByRole("button", { name: "valvola" }));

        expect(screen.getByRole("link", { name: "Statistiche" })).not.toHaveAttribute("aria-disabled");
    });
});
