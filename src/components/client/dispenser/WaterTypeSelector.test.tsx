import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import WaterTypeSelector from "@/components/client/dispenser/WaterTypeSelector";
import { DISPENSE_OPERATIONS } from "@/service/utils";

const [STILL_ROOM, STILL_COLD, SPARKLING] = DISPENSE_OPERATIONS;

describe("WaterTypeSelector", () => {
    test("offers every water type as a large button", () => {
        render(<WaterTypeSelector selected={STILL_ROOM} isLocked={false} onSelect={() => { }} />);

        const group = screen.getByRole("group", { name: "Tipo di acqua" });
        expect(group).toBeInTheDocument();
        expect(screen.getAllByRole("button")).toHaveLength(3);
        expect(screen.getByRole("button", { name: "Frizzante Fredda" })).toBeInTheDocument();
    });

    test("marks the selected type as pressed", () => {
        render(<WaterTypeSelector selected={STILL_COLD} isLocked={false} onSelect={() => { }} />);

        expect(screen.getByRole("button", { name: "Naturale Fredda" })).toHaveAttribute("aria-pressed", "true");
        expect(screen.getByRole("button", { name: "Naturale Ambiente" })).toHaveAttribute("aria-pressed", "false");
    });

    test("selects the tapped type", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<WaterTypeSelector selected={STILL_ROOM} isLocked={false} onSelect={onSelect} />);

        await user.click(screen.getByRole("button", { name: "Frizzante Fredda" }));

        expect(onSelect).toHaveBeenCalledWith(SPARKLING);
    });

    test("keeps the other types out of reach while water is running", async () => {
        const user = userEvent.setup();
        const onSelect = vi.fn();
        render(<WaterTypeSelector selected={SPARKLING} isLocked onSelect={onSelect} />);

        expect(screen.getByRole("button", { name: "Naturale Ambiente" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Frizzante Fredda" })).toBeEnabled();

        await user.click(screen.getByRole("button", { name: "Naturale Ambiente" }));
        expect(onSelect).not.toHaveBeenCalled();
    });
});
