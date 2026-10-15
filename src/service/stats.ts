/* Pure calculations and formatting behind the stats screen. The page loads the
   rows from the db and hands them here; components only render the results. */

import { DispenseModel, DispenseOperation } from "@/service/types";
import { DISPENSE_OPERATIONS, findDispenseOperation, toThousandsRounded } from "@/service/utils";

const LITRES_FORMAT = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const INTEGER_FORMAT = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 0 });
const DATE_FORMAT = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
const MONTH_FORMAT = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });

export const formatLitres = (litres: number): string => LITRES_FORMAT.format(litres);

export const formatInteger = (value: number): string => INTEGER_FORMAT.format(value);

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
