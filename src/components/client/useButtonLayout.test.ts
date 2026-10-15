import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

import { useButtonLayout } from "@/components/client/useButtonLayout";
import { BUTTON_LAYOUT_ATTRIBUTE, BUTTON_LAYOUT_STORAGE_KEY } from "@/service/buttonLayout";

describe("useButtonLayout", () => {
    afterEach(() => {
        localStorage.clear();
        document.documentElement.removeAttribute(BUTTON_LAYOUT_ATTRIBUTE);
    });

    test("starts from the layout the head script applied", () => {
        document.documentElement.setAttribute(BUTTON_LAYOUT_ATTRIBUTE, "row");

        const { result } = renderHook(() => useButtonLayout());

        expect(result.current[0]).toBe("row");
    });

    test("starts from the right-hand column when nothing was applied", () => {
        const { result } = renderHook(() => useButtonLayout());

        expect(result.current[0]).toBe("column");
    });

    test("switching the layout updates every reader, <html> and the storage", () => {
        const first = renderHook(() => useButtonLayout());
        const second = renderHook(() => useButtonLayout());

        act(() => first.result.current[1]("row"));

        expect(first.result.current[0]).toBe("row");
        expect(second.result.current[0]).toBe("row");
        expect(document.documentElement.getAttribute(BUTTON_LAYOUT_ATTRIBUTE)).toBe("row");
        expect(localStorage.getItem(BUTTON_LAYOUT_STORAGE_KEY)).toBe("row");
    });
});
