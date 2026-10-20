import { useMantineColorScheme } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ScreenPanel from "@/components/client/settings/ScreenPanel";
import { BUTTON_LAYOUT_ATTRIBUTE, BUTTON_LAYOUT_STORAGE_KEY } from "@/service/buttonLayout";

vi.mock("@mantine/core", () => ({ useMantineColorScheme: vi.fn() }));

const setColorScheme = vi.fn();

const mockScreen = (colorScheme: "dark" | "light") => {
    vi.mocked(useMantineColorScheme).mockReturnValue(
        { colorScheme, setColorScheme } as unknown as ReturnType<typeof useMantineColorScheme>
    );
};

describe("ScreenPanel", () => {
    beforeEach(() => {
        mockScreen("dark");
    });

    afterEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        document.documentElement.removeAttribute(BUTTON_LAYOUT_ATTRIBUTE);
    });

    test("marks the current theme and switches to the other one", async () => {
        const user = userEvent.setup();
        render(<ScreenPanel />);

        expect(screen.getByRole("button", { name: "Scuro" })).toHaveAttribute("aria-pressed", "true");
        await user.click(screen.getByRole("button", { name: "Chiaro" }));

        expect(setColorScheme).toHaveBeenCalledWith("light");
    });

    test("moves the water type buttons and remembers it", async () => {
        const user = userEvent.setup();
        render(<ScreenPanel />);

        expect(screen.getByRole("button", { name: /A destra/ })).toHaveAttribute("aria-pressed", "true");
        await user.click(screen.getByRole("button", { name: /Sotto/ }));

        expect(screen.getByRole("button", { name: /Sotto/ })).toHaveAttribute("aria-pressed", "true");
        expect(localStorage.getItem(BUTTON_LAYOUT_STORAGE_KEY)).toBe("row");
    });

    test("marks the light theme when it is the current one", () => {
        mockScreen("light");
        render(<ScreenPanel />);

        expect(screen.getByRole("button", { name: "Chiaro" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Scuro" })).toHaveAttribute("aria-pressed", "false");
    });

    test("marks the button layout as a kiosk-only setting, hidden on a phone", () => {
        render(<ScreenPanel />);

        expect(screen.getByRole("group", { name: "Pulsanti tipo di acqua" })).toHaveAttribute("data-kiosk-only");
        expect(screen.getByRole("group", { name: "Tema" })).not.toHaveAttribute("data-kiosk-only");
    });

    test("offers no full screen switch: the kiosk browser is already full screen", () => {
        render(<ScreenPanel />);

        expect(screen.queryByRole("switch")).not.toBeInTheDocument();
        expect(screen.queryByText(/Schermo intero/)).not.toBeInTheDocument();
    });
});
