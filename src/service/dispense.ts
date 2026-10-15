/* Pure helpers behind the dispense dial: what the timer shows, how much water
   that roughly is, and how high the water in the dial sits. */

/* the valve closes on its own after this long, in case nobody taps stop */
export const MAX_DISPENSE_SEC = 60;

/* seconds of flow after which the dial looks full: a glass, not the real volume */
const FILL_SECONDS = 12;
/* the water is drawn by sliding it down: 86% down leaves a thin layer at the bottom */
const IDLE_OFFSET = 86;
const FULL_OFFSET = 6;

export const formatElapsed = (seconds: number): string => {
    const whole = Math.max(0, Math.floor(seconds));
    return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/* there is no flow meter: quantity is always duration × the type's ml/sec factor */
export const estimateMl = (seconds: number, factor: number): number =>
    Math.round(Math.max(0, seconds) * factor);

/* translateY offset of the water, in percent of the dial; null means idle */
export const waterLevelOffset = (elapsedSec: number | null): number => {
    if (elapsedSec === null) return IDLE_OFFSET;

    const progress = Math.min(Math.max(elapsedSec, 0) / FILL_SECONDS, 1);
    return Math.round(IDLE_OFFSET - progress * (IDLE_OFFSET - FULL_OFFSET));
};

/* "Naturale Ambiente" → a bold "Naturale" over a lighter "Ambiente" */
export const splitOperationName = (name: string): { title: string; subtitle: string } => {
    const [title, ...rest] = name.split(" ");
    return { title, subtitle: rest.join(" ") };
};
