"use client";

import { useSyncExternalStore } from "react";

import {
    BUTTON_LAYOUT_ATTRIBUTE,
    ButtonLayout,
    DEFAULT_BUTTON_LAYOUT,
    parseButtonLayout,
    writeButtonLayout,
} from "@/service/buttonLayout";

/* the attribute on <html> (set by BUTTON_LAYOUT_SCRIPT, then by setButtonLayout)
   is the single source of truth; components subscribe to it */
const listeners = new Set<() => void>();

const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};

const getSnapshot = (): ButtonLayout =>
    parseButtonLayout(document.documentElement.getAttribute(BUTTON_LAYOUT_ATTRIBUTE));

const getServerSnapshot = (): ButtonLayout => DEFAULT_BUTTON_LAYOUT;

const setButtonLayout = (layout: ButtonLayout) => {
    if (!writeButtonLayout(() => window.localStorage, layout)) {
        console.warn("Button layout not saved: it will reset on the next reload");
    }

    document.documentElement.setAttribute(BUTTON_LAYOUT_ATTRIBUTE, layout);
    listeners.forEach(listener => listener());
};

export function useButtonLayout(): [ButtonLayout, (layout: ButtonLayout) => void] {
    const layout = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

    return [layout, setButtonLayout];
}
