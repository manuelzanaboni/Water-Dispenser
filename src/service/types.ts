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
    factor: number; // ml/sec
}

export interface DispenseModel {
    id?: number;
    operation_type: number;
    duration: number;
    qty?: number;
    ts: number;
}

export interface AggregateDispenseModel {
    operation_type: number;
    duration: number;
}

export interface FilterModel {
    id?: number;
    qty: number;
    ts: number;
}

export interface RefrigeratorModel {
    ts: number;
    temperature: number | null;
    state: number;
}
