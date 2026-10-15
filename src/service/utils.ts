import { IconChartBubble, IconDroplet, IconSnowflake } from "@tabler/icons-react";

import { DispenseOperation } from "@/service/types";

export const RELAYS = {
    RELAY1: 2,
    RELAY2: 4,
    RELAY3: 5,
    RELAY4: 8,
}

const STILL = RELAYS.RELAY1;
const COLD = RELAYS.RELAY2;
const SPARKLING = RELAYS.RELAY3;
const REFRIGERATOR = RELAYS.RELAY4;

export const SPARKLING_OPERATION: DispenseOperation = {
    relay: SPARKLING,
    name: "Frizzante Fredda",
    type: 3,
    factor: 37, // ml/sec
    color: "#36C2A3", // aquamarine, --kiosk-water-frizzante
    slug: "frizzante"
};

export const DISPENSE_OPERATIONS: DispenseOperation[] = [
    {
        relay: STILL,
        name: "Naturale Ambiente",
        type: 1,
        factor: 32, // ml/sec
        color: "#E3C99A", // sand, --kiosk-water-ambiente
        slug: "ambiente"
    }, {
        relay: COLD,
        name: "Naturale Fredda",
        type: 2,
        factor: 32, // ml/sec
        color: "#8FD0FA", // ice, --kiosk-water-fredda
        slug: "fredda"
    },
    SPARKLING_OPERATION
];

/* kept out of DispenseOperation: those objects cross the server action boundary and must stay serializable */
export const OPERATION_ICONS: Record<number, typeof IconDroplet> = {
    1: IconDroplet,
    2: IconSnowflake,
    3: IconChartBubble
};

export const findDispenseOperation = (type: number) => DISPENSE_OPERATIONS.find(d => d.type === type);

export const toThousandsRounded = (value: number) => Math.round(value / 1000 * 10) / 10;

const TEMPERATURE_FORMAT = new Intl.NumberFormat("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const CLOCK_FORMAT = new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

export const formatClock = (date: Date): string => CLOCK_FORMAT.format(date);

export const formatTemperature = (celsius: number | null): string =>
    celsius === null ? "—" : `${TEMPERATURE_FORMAT.format(celsius)}°`;
