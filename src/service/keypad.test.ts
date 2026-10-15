import { describe, expect, test } from "vitest";

import { initialKeypad, isValidQuantity, keypadQuantity, keypadReducer, KeypadState } from "@/service/keypad";

const press = (state: KeypadState, ...keys: string[]) =>
    keys.reduce((current, key) => keypadReducer(current, { type: "press", key }), state);

describe("keypad entry", () => {
    test("starts from the given value", () => {
        expect(initialKeypad(1500).value).toBe("1500");
        expect(initialKeypad().value).toBe("0");
    });

    test("replaces the leading zero with the first digit", () => {
        expect(press(initialKeypad(), "7", "5").value).toBe("75");
    });

    test("stops at five digits", () => {
        expect(press(initialKeypad(), "1", "2", "3", "4", "5", "6").value).toBe("12345");
    });

    test("clears back to zero", () => {
        expect(press(initialKeypad(1500), "clear").value).toBe("0");
    });

    test("deletes the last digit, down to zero", () => {
        expect(press(initialKeypad(150), "back").value).toBe("15");
        expect(press(initialKeypad(5), "back").value).toBe("0");
    });

    test("ignores keys it does not know", () => {
        expect(press(initialKeypad(15), "x").value).toBe("15");
    });

    test("reads back the value as a number", () => {
        expect(keypadQuantity(initialKeypad(600))).toBe(600);
    });
});

describe("keypad confirmation", () => {
    test("asks for confirmation before saving", () => {
        expect(keypadReducer(initialKeypad(1500), { type: "submit" }).step).toBe("confirm");
    });

    test("does not ask for confirmation of zero", () => {
        expect(keypadReducer(initialKeypad(), { type: "submit" }).step).toBe("entry");
    });

    test("goes back to the keypad with the value untouched", () => {
        const confirming = keypadReducer(initialKeypad(1500), { type: "submit" });
        const corrected = keypadReducer(confirming, { type: "cancel" });

        expect(corrected.step).toBe("entry");
        expect(corrected.value).toBe("1500");
    });

    test("ignores keys while asking for confirmation", () => {
        const confirming = keypadReducer(initialKeypad(1500), { type: "submit" });

        expect(press(confirming, "1").value).toBe("1500");
    });
});

describe("keypad saving", () => {
    test("goes to done once saved", () => {
        const saving = keypadReducer(initialKeypad(1500), { type: "saving" });
        const done = keypadReducer(saving, { type: "saved" });

        expect(saving.step).toBe("saving");
        expect(done.step).toBe("done");
        expect(done.value).toBe("1500");
    });

    test("ignores keys while saving", () => {
        const saving = keypadReducer(initialKeypad(1500), { type: "saving" });

        expect(press(saving, "1").value).toBe("1500");
    });

    test("returns to the entry with a message when saving fails", () => {
        const saving = keypadReducer(initialKeypad(1500), { type: "saving" });
        const failed = keypadReducer(saving, { type: "failed", message: "Registrazione non riuscita" });

        expect(failed.step).toBe("entry");
        expect(failed.value).toBe("1500");
        expect(failed.error).toBe("Registrazione non riuscita");
    });

    test("clears the message as soon as the value changes", () => {
        const failed = keypadReducer(initialKeypad(15), { type: "failed", message: "Registrazione non riuscita" });

        expect(press(failed, "0").error).toBeNull();
    });

    test("starts over from a fresh value", () => {
        const done = keypadReducer(keypadReducer(initialKeypad(1500), { type: "saving" }), { type: "saved" });

        expect(keypadReducer(done, { type: "reset", value: 1500 })).toEqual(initialKeypad(1500));
    });
});

describe("isValidQuantity", () => {
    test("accepts whole positive numbers that fit the keypad", () => {
        expect(isValidQuantity(1)).toBe(true);
        expect(isValidQuantity(99_999)).toBe(true);
    });

    test("rejects zero, negatives, fractions, oversize and non numbers", () => {
        for (const value of [0, -5, 1.5, 100_000, Number.NaN, "1500", null]) {
            expect(isValidQuantity(value)).toBe(false);
        }
    });
});
