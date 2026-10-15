/* Where the water type buttons sit on the dispenser screen: a column on the
   right (default) or a row at the bottom. The choice survives reloads through
   localStorage and is mirrored on <html> so CSS can lay the screen out before
   React hydrates. */

export const BUTTON_LAYOUTS = ["column", "row"] as const;

export type ButtonLayout = typeof BUTTON_LAYOUTS[number];

export const DEFAULT_BUTTON_LAYOUT: ButtonLayout = "column";

export const BUTTON_LAYOUT_STORAGE_KEY = "buttonLayout";

export const BUTTON_LAYOUT_ATTRIBUTE = "data-button-layout";

type ReadableStorage = Pick<Storage, "getItem">;
type WritableStorage = Pick<Storage, "setItem">;

export const parseButtonLayout = (value: unknown): ButtonLayout =>
    BUTTON_LAYOUTS.find(layout => layout === value) ?? DEFAULT_BUTTON_LAYOUT;

/* the storage is reached through a getter: on some browsers (private mode,
   blocked site data) even touching window.localStorage throws */
export const readButtonLayout = (getStorage: () => ReadableStorage): ButtonLayout => {
    try {
        return parseButtonLayout(getStorage().getItem(BUTTON_LAYOUT_STORAGE_KEY));
    } catch {
        return DEFAULT_BUTTON_LAYOUT;
    }
};

export const writeButtonLayout = (getStorage: () => WritableStorage, layout: ButtonLayout): boolean => {
    try {
        getStorage().setItem(BUTTON_LAYOUT_STORAGE_KEY, layout);
        return true;
    } catch {
        return false;
    }
};

/* inlined in <head>: runs before first paint, so a stored "row" layout never
   flashes as the default column. Built from the constants above, no user input. */
export const BUTTON_LAYOUT_SCRIPT = `(function(){var l=${JSON.stringify(DEFAULT_BUTTON_LAYOUT)};`
    + `try{var v=localStorage.getItem(${JSON.stringify(BUTTON_LAYOUT_STORAGE_KEY)});`
    + `if(${JSON.stringify(BUTTON_LAYOUTS)}.indexOf(v)>=0)l=v;}catch(e){}`
    + `document.documentElement.setAttribute(${JSON.stringify(BUTTON_LAYOUT_ATTRIBUTE)},l);})();`;
