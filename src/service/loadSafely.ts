/* for server pages: one failing query must not take the whole screen down,
   so it is logged and replaced by empty data */
export const loadSafely = async <T,>(what: string, load: () => Promise<T>, fallback: T): Promise<T> => {
    try {
        return await load();
    } catch (error) {
        console.error(`Could not load ${what}`, error);
        return fallback;
    }
};
