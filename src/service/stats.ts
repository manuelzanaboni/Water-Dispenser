/* Pure calculations and formatting behind the stats screen. The page loads the
   rows from the db and hands them here; components only render the results. */

import {
    AggregateDispenseFilterModel,
    AggregateDispenseTankModel,
    DispenseModel,
    DispenseOperation,
    FilterModel,
    RefrigeratorModel,
    TankModel,
} from "@/service/types";
import { DISPENSE_OPERATIONS, findDispenseOperation, SPARKLING_OPERATION, toThousandsRounded } from "@/service/utils";

const LITRES_FORMAT = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const DATE_FORMAT = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
const MONTH_FORMAT = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });

export const formatLitres = (litres: number): string => LITRES_FORMAT.format(litres);

/* thousands grouped by hand: Intl's it-IT leaves 4-digit numbers ungrouped
   (1188, not 1.188), and the "always" grouping option is not typed here yet */
export const formatInteger = (value: number): string => {
    const digits = String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return value < 0 && Math.round(value) !== 0 ? `-${digits}` : digits;
};

/* unix seconds, as stored in the db */
export const formatDate = (ts: number): string => DATE_FORMAT.format(new Date(ts * 1000));

export const formatMonth = (date: Date): string => {
    const label = MONTH_FORMAT.format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
};

/* rows written before qty existed only have a duration */
const dispensedMl = (dispense: DispenseModel, operation: DispenseOperation): number =>
    dispense.qty ?? dispense.duration * operation.factor;

export type TypeSummary = {
    operation: DispenseOperation;
    litres: number;
    /* 0..1 of the month's total, for the bar under each tile */
    share: number;
};

export type MonthlySummary = {
    types: TypeSummary[];
    totalLitres: number;
};

export const monthlySummary = (dispenses: DispenseModel[]): MonthlySummary => {
    const mlByType = new Map<number, number>();

    for (const dispense of dispenses) {
        const operation = findDispenseOperation(dispense.operation_type);
        if (!operation) continue;

        mlByType.set(operation.type, (mlByType.get(operation.type) ?? 0) + dispensedMl(dispense, operation));
    }

    const totalMl = [...mlByType.values()].reduce((sum, ml) => sum + ml, 0);

    return {
        types: DISPENSE_OPERATIONS.map(operation => {
            const ml = mlByType.get(operation.type) ?? 0;
            return { operation, litres: toThousandsRounded(ml), share: totalMl > 0 ? ml / totalMl : 0 };
        }),
        totalLitres: toThousandsRounded(totalMl),
    };
};

/* how many days of bars the CO₂ card shows */
const TANK_BAR_DAYS = 14;
const DAY_SEC = 86_400;

/* the db groups by strftime('%Y-%m-%d', ts, 'unixepoch'): a UTC calendar day */
const dayKey = (ts: number): string => new Date(ts * 1000).toISOString().slice(0, 10);

const sparklingLitres = (durationSec: number): number => toThousandsRounded(durationSec * SPARKLING_OPERATION.factor);

export type TankBar = {
    day: string;
    litres: number;
};

export type TankPeriod = {
    id?: number;
    qtyGrams: number;
    from: number;
    /* when the next tank replaced it; null for the tank in use */
    to: number | null;
    litres: number;
    bars: TankBar[];
};

export const tankPeriods = (
    tanks: TankModel[],
    sparklingDays: AggregateDispenseTankModel[],
    nowTs: number,
): TankPeriod[] => {
    const ordered = [...tanks].sort((a, b) => a.ts - b.ts);

    return ordered.map((tank, index) => {
        const to = ordered[index + 1]?.ts ?? null;
        const endTs = to ?? nowTs;
        const [fromDay, endDay] = [dayKey(tank.ts), dayKey(endTs)];

        // both ends included, as the previous screen's BETWEEN query did
        const secondsByDay = new Map(
            sparklingDays
                .filter(({ day }) => day >= fromDay && day <= endDay)
                .map(({ day, duration }) => [day, duration])
        );
        const totalSec = [...secondsByDay.values()].reduce((sum, sec) => sum + sec, 0);

        const bars = Array.from({ length: TANK_BAR_DAYS }, (_, i) => {
            const day = dayKey(endTs - (TANK_BAR_DAYS - 1 - i) * DAY_SEC);
            return { day, litres: sparklingLitres(secondsByDay.get(day) ?? 0) };
        });

        return { id: tank.id, qtyGrams: tank.qty, from: tank.ts, to, litres: sparklingLitres(totalSec), bars };
    });
};

/* the fridge card covers the last 12 hours of readings */
const FRIDGE_WINDOW_SEC = 12 * 60 * 60;
/* READ_TEMP_DELTA_SEC in production, used when the setting is missing */
const DEFAULT_READ_INTERVAL_SEC = 120;

export const fridgeReadingsLimit = (readIntervalSec: number | undefined): number => {
    const interval = readIntervalSec && readIntervalSec > 0 ? readIntervalSec : DEFAULT_READ_INTERVAL_SEC;
    return Math.ceil(FRIDGE_WINDOW_SEC / interval);
};

export type FridgeSeries = {
    current: number;
    min: number;
    max: number;
    /* oldest first, for the sparkline */
    temperatures: number[];
};

export const fridgeSeries = (readings: RefrigeratorModel[]): FridgeSeries | null => {
    const temperatures = [...readings]
        .sort((a, b) => a.ts - b.ts)
        .map(reading => reading.temperature)
        .filter((temperature): temperature is number => temperature !== null);

    if (temperatures.length === 0) return null;

    return {
        current: temperatures[temperatures.length - 1],
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
        temperatures,
    };
};

/* below this share of its capacity the filter gauge turns to the warning color */
const LOW_FILTER_RATIO = 0.1;

export type FilterStatus = {
    capacityLitres: number;
    remainingLitres: number;
    /* 0..1, drives the gauge */
    remainingRatio: number;
    isLow: boolean;
    since: number;
};

/* the db view already sums the dispense seconds per type since the last filter */
export const filterStatus = (
    filter: FilterModel | undefined,
    usage: AggregateDispenseFilterModel[],
): FilterStatus | null => {
    if (!filter) return null;

    const usedMl = usage.reduce((sum, { operation_type, duration }) => {
        const operation = findDispenseOperation(operation_type);
        return operation ? sum + duration * operation.factor : sum;
    }, 0);

    const remainingLitres = Math.max(0, filter.qty - toThousandsRounded(usedMl));
    const remainingRatio = filter.qty > 0 ? remainingLitres / filter.qty : 0;

    return {
        capacityLitres: filter.qty,
        remainingLitres,
        remainingRatio,
        isLow: remainingRatio < LOW_FILTER_RATIO,
        since: filter.ts,
    };
};
