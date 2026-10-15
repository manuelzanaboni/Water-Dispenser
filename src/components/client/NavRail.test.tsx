import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, test, vi } from "vitest";

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
