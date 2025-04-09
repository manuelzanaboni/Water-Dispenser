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

export const DISPENSE_OPERATIONS: DispenseOperation[] = [
    {
        relay: STILL,
        name: "Naturale Ambiente",
        type: 1
    }, {
        relay: COLD,
        name: "Naturale Fredda",
        type: 2
    }, {
        relay: SPARKLING,
        name: "Frizzante Fredda",
        type: 3
    }
];

export const findDispenseOperation = (type: number) => DISPENSE_OPERATIONS.find(d => d.type === type);

export const buildTimestamp = (ts: number) => `${new Date(ts * 1000).toLocaleString("it-IT")}`;
