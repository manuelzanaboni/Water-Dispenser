export enum GPIO_MODE {
    IN = "in",
    OUT = "out",
}

export enum GPIO_STATE {
    LOW = "0",
    HIGH = "1",
}

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