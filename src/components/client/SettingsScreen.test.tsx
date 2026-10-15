import { useMantineColorScheme } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

import SettingsScreen from "@/components/client/SettingsScreen";
import { insertFilter, insertTank } from "@/service/db";

vi.mock("@mantine/core", () => ({ useMantineColorScheme: vi.fn() }));
vi.mock("@mantine/hooks", () => ({ useFullscreen: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/service/db", () => ({ insertFilter: vi.fn(), insertTank: vi.fn() }));

const refresh = vi.fn();
const ts = (iso: string) => Date.parse(`${iso}T12:00:00Z`) / 1000;

const renderScreen = (props: Partial<React.ComponentProps<typeof SettingsScreen>> = {}) => {
    const user = userEvent.setup();
    render(
        <SettingsScreen
            version="2.0.0"
            lastFilter={{ qty: 1500, ts: ts("2026-09-02") }}
            lastTank={{ qty: 600, ts: ts("2026-09-12") }}
            {...props}
        />
    );
    return user;
};

const menuItem = (name: RegExp) => screen.getByRole("button", { name });

describe("SettingsScreen", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useMantineColorScheme).mockReturnValue(
            { colorScheme: "dark", setColorScheme: vi.fn() } as unknown as ReturnType<typeof useMantineColorScheme>
        );
        vi.mocked(useFullscreen).mockReturnValue(
            { fullscreen: false, toggle: vi.fn() } as unknown as ReturnType<typeof useFullscreen>
        );
        vi.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>);
        vi.mocked(insertFilter).mockResolvedValue(undefined);
        vi.mocked(insertTank).mockResolvedValue(undefined);
    });

    test("opens on the screen settings", () => {
        renderScreen();

        expect(menuItem(/^Schermo/)).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByText("Tema")).toBeInTheDocument();
    });

    test("lists the last filter and tank under their entries", () => {
        renderScreen();

        expect(menuItem(/^Nuovo filtro/)).toHaveTextContent("Ultimo: 02/09/2026 · 1.500 l");
        expect(menuItem(/^Nuova bombola/)).toHaveTextContent("Ultima: 12/09/2026 · 600 g");
    });

    test("says when nothing was registered yet", () => {
        renderScreen({ lastFilter: null, lastTank: null });

        expect(menuItem(/^Nuovo filtro/)).toHaveTextContent("Nessun filtro registrato");
        expect(menuItem(/^Nuova bombola/)).toHaveTextContent("Nessuna bombola registrata");
    });

    test("registers a new filter after confirmation and refreshes the data", async () => {
        const user = renderScreen();

        await user.click(menuItem(/^Nuovo filtro/));
        expect(screen.getByRole("status", { name: "Valore inserito" })).toHaveTextContent("1.500 litri");

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));
        await user.click(screen.getByRole("button", { name: "Sì, registra" }));

        expect(insertFilter).toHaveBeenCalledWith(1500);
        expect(refresh).toHaveBeenCalled();
    });

    test("registers a new tank in grams", async () => {
        const user = renderScreen();

        await user.click(menuItem(/^Nuova bombola/));
        expect(screen.getByRole("status", { name: "Valore inserito" })).toHaveTextContent("600 g");

        await user.click(screen.getByRole("button", { name: "Registra nuova bombola" }));
        await user.click(screen.getByRole("button", { name: "Sì, registra" }));

        expect(insertTank).toHaveBeenCalledWith(600);
    });

    test("shows the version under the info entry", async () => {
        const user = renderScreen();

        await user.click(menuItem(/^Informazioni/));

        expect(screen.getByText("Orange Pi Zero 3")).toBeInTheDocument();
    });
});
