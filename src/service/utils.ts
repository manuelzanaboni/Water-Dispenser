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
    factor: 37 // ml/sec
};

export const DISPENSE_OPERATIONS: DispenseOperation[] = [
    {
        relay: STILL,
        name: "Naturale Ambiente",
        type: 1,
        factor: 32 // ml/sec
    }, {
        relay: COLD,
        name: "Naturale Fredda",
        type: 2,
        factor: 32 // ml/sec
    },
    SPARKLING_OPERATION
];

export const findDispenseOperation = (type: number) => DISPENSE_OPERATIONS.find(d => d.type === type);

export const buildTimestamp = (ts: number) => `${new Date(ts * 1000).toLocaleString("it-IT")}`;

export const buildDateTimestamp = (ts: number) => `${new Date(ts * 1000).toLocaleDateString("it-IT")}`;

export const toThousandsRounded = (value: number) => Math.round(value / 1000 * 10) / 10;
