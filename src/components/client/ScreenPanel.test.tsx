import { useMantineColorScheme } from "@mantine/core";
import { useFullscreen } from "@mantine/hooks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ScreenPanel from "@/components/client/ScreenPanel";
import { BUTTON_LAYOUT_ATTRIBUTE, BUTTON_LAYOUT_STORAGE_KEY } from "@/service/buttonLayout";

vi.mock("@mantine/core", () => ({ useMantineColorScheme: vi.fn() }));
vi.mock("@mantine/hooks", () => ({ useFullscreen: vi.fn() }));

const setColorScheme = vi.fn();
const toggleFullscreen = vi.fn();

const mockScreen = (colorScheme: "dark" | "light", fullscreen: boolean) => {
    vi.mocked(useMantineColorScheme).mockReturnValue(
        { colorScheme, setColorScheme } as unknown as ReturnType<typeof useMantineColorScheme>
    );
    vi.mocked(useFullscreen).mockReturnValue(
        { fullscreen, toggle: toggleFullscreen } as unknown as ReturnType<typeof useFullscreen>
    );
};

describe("ScreenPanel", () => {
    beforeEach(() => {
        mockScreen("dark", false);
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

    test("toggles full screen", async () => {
        const user = userEvent.setup();
        render(<ScreenPanel />);

        const toggle = screen.getByRole("switch", { name: "Schermo intero Nasconde le barre del browser" });
        expect(screen.getByRole("button", { name: "A destra in colonna" })).toBeInTheDocument();
        expect(toggle).toHaveAttribute("aria-checked", "false");
        await user.click(toggle);

        expect(toggleFullscreen).toHaveBeenCalledOnce();
    });

    test("shows full screen as on when it already is", () => {
        mockScreen("light", true);
        render(<ScreenPanel />);

        expect(screen.getByRole("switch", { name: /Schermo intero/ })).toHaveAttribute("aria-checked", "true");
        expect(screen.getByRole("button", { name: "Chiaro" })).toHaveAttribute("aria-pressed", "true");
    });
});
