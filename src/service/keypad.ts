/* The on-screen keypad used to register a new filter or CO₂ tank, as a pure
   state machine: entry → confirm → saving → done. Cancelling the confirmation
   or a failed save goes back to the entry with the typed value kept. */

export const MAX_DIGITS = 5;

const DIGITS = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);

export type KeypadStep = "entry" | "confirm" | "saving" | "done";

export type KeypadState = {
    step: KeypadStep;
    /* the digits as typed, "0" when empty */
    value: string;
    error: string | null;
};

export type KeypadAction =
    | { type: "press"; key: string }
    | { type: "submit" }
    | { type: "cancel" }
    | { type: "saving" }
    | { type: "saved" }
    | { type: "failed"; message: string }
    | { type: "reset"; value: number };

export const initialKeypad = (value = 0): KeypadState => ({ step: "entry", value: String(value), error: null });

export const keypadQuantity = (state: KeypadState): number => Number(state.value);

/* also checked by the server actions: they are reachable from any client */
export const isValidQuantity = (quantity: unknown): quantity is number =>
    typeof quantity === "number" && Number.isInteger(quantity) && quantity > 0 && quantity < 10 ** MAX_DIGITS;

const typeKey = (value: string, key: string): string => {
    if (key === "clear") return "0";
    if (key === "back") return value.length > 1 ? value.slice(0, -1) : "0";
    if (!DIGITS.has(key) || value.length >= MAX_DIGITS) return value;

    return value === "0" ? key : value + key;
};

export const keypadReducer = (state: KeypadState, action: KeypadAction): KeypadState => {
    switch (action.type) {
        case "press":
            if (state.step !== "entry") return state;
            return { ...state, value: typeKey(state.value, action.key), error: null };
        case "submit":
            if (state.step !== "entry" || !isValidQuantity(keypadQuantity(state))) return state;
            return { ...state, step: "confirm", error: null };
        case "cancel":
            return state.step === "confirm" ? { ...state, step: "entry" } : state;
        case "saving":
            return { ...state, step: "saving", error: null };
        case "saved":
            return { ...state, step: "done" };
        case "failed":
            return { ...state, step: "entry", error: action.message };
        case "reset":
            return initialKeypad(action.value);
    }
};
