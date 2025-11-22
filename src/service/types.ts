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
    duration: number;
}

export interface AggregateDispenseFilterModel extends AggregateDispenseModel {
    operation_type: number;
}

export interface AggregateDispenseTankModel extends AggregateDispenseModel {
    day: string;
}

interface PointInTimeWithQuantity {
    id?: number;
    qty: number;
    ts: number;
}

export interface FilterModel extends PointInTimeWithQuantity { }

export interface TankModel extends PointInTimeWithQuantity { }

export interface RefrigeratorModel {
    ts: number;
    temperature: number | null;
    state: number;
}
