import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import KeyPadPanel from "@/components/client/settings/KeyPadPanel";

const renderPanel = (onSave = vi.fn().mockResolvedValue(undefined), initialValue = 1500) => {
    const user = userEvent.setup();
    render(
        <KeyPadPanel
            prompt="Capacità del filtro installato"
            unit="litri"
            cta="Registra nuovo filtro"
            question="Registrare un nuovo filtro da"
            doneLabel="Filtro registrato"
            initialValue={initialValue}
            onSave={onSave}
        />
    );
    return { user, onSave };
};

const display = () => screen.getByRole("status", { name: "Valore inserito" });

describe("KeyPadPanel", () => {
    test("starts from the previous value", () => {
        renderPanel();

        expect(screen.getByText("Capacità del filtro installato")).toBeInTheDocument();
        expect(display()).toHaveTextContent("1.500 litri");
    });

    test("types a new value with the large keys", async () => {
        const { user } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Azzera" }));
        for (const key of ["6", "0", "0"]) await user.click(screen.getByRole("button", { name: key }));

        expect(display()).toHaveTextContent("600 litri");
    });

    test("deletes the last digit", async () => {
        const { user } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Cancella ultima cifra" }));

        expect(display()).toHaveTextContent("150 litri");
    });

    test("cannot register zero", async () => {
        const { user } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Azzera" }));

        expect(screen.getByRole("button", { name: "Registra nuovo filtro" })).toBeDisabled();
    });

    test("asks to confirm the value before saving anything", async () => {
        const { user, onSave } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));

        const dialog = screen.getByRole("alertdialog", { name: "Conferma registrazione" });
        expect(dialog).toHaveTextContent("Registrare un nuovo filtro da");
        expect(dialog).toHaveTextContent("1.500 litri");
        expect(onSave).not.toHaveBeenCalled();
    });

    test("goes back to the keypad to correct the value", async () => {
        const { user, onSave } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));
        await user.click(screen.getByRole("button", { name: "Correggi" }));

        expect(display()).toHaveTextContent("1.500 litri");
        expect(onSave).not.toHaveBeenCalled();
    });

    test("saves the value once confirmed and says so", async () => {
        const { user, onSave } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));
        await user.click(screen.getByRole("button", { name: "Sì, registra" }));

        expect(onSave).toHaveBeenCalledWith(1500);
        expect(await screen.findByText("Filtro registrato: 1.500 litri")).toBeInTheDocument();
    });

    test("goes back to the keypad after the registration", async () => {
        const { user } = renderPanel();

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));
        await user.click(screen.getByRole("button", { name: "Sì, registra" }));
        await user.click(await screen.findByRole("button", { name: "Fatto" }));

        expect(display()).toHaveTextContent("1.500 litri");
    });

    test("says so and keeps the value when saving fails", async () => {
        vi.spyOn(console, "error").mockImplementation(() => { });
        const { user } = renderPanel(vi.fn().mockRejectedValue(new Error("SQLITE_BUSY")));

        await user.click(screen.getByRole("button", { name: "Registra nuovo filtro" }));
        await user.click(screen.getByRole("button", { name: "Sì, registra" }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Registrazione non riuscita. Riprova.");
        expect(display()).toHaveTextContent("1.500 litri");
    });
});
