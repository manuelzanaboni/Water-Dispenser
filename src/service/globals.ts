export enum GPIO_MODE {
    IN = "in",
    OUT = "out",
}

export enum GPIO_STATE {
    LOW = "0",
    HIGH = "1",
}

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

export interface DispenseOperation {
    relay: number;
    name: string;
    type: number;
}

export interface DispenseModel {
    id?: number;
    operation_type: number;
    duration: number;
    qty?: number;
    ts: number;
}

export interface Settings {
    id: number
    config: object
}