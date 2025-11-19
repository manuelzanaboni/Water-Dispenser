"use server";

import sqlite3 from "sqlite3";

import { revalidatePath } from "next/cache";

import { AggregateDispenseModel, DispenseModel, DispenseOperation, FilterModel, RefrigeratorModel } from "@/service/types";

const DB = process.env.DB_FILE ?? "water-dispenser.db";
const DISPENSES_TABLE = "dispenses";
const AGGREGATE_DISPENSES_VIEW = "aggregate_dispenses";
const FILTERS_TABLE = "filters";
const TANKS_TABLE = "tanks";
const SETTINGS_TABLE = "settings";
const REFRIGERATOR_TABLE = "refrigerator";

const db = new sqlite3.Database(
    DB,
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err: Error | null) => {
        if (err) {
            return console.error(err.message);
        }

        console.log("Connected to the SQlite database.");

        db.serialize(() => {

            console.log("SQL Initialization...");

            // types.ts - interface DispenseModel
            db.run(
                `CREATE TABLE IF NOT EXISTS ${DISPENSES_TABLE} (
                    id INTEGER PRIMARY KEY,
                    operation_type INTEGER NOT NULL,
                    duration INTEGER NOT NULL,
                    qty INTEGER,
                    ts INTEGER DEFAULT (strftime('%s', 'now'))
                )`,
                (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                }
            );

            // types.ts - interface FilterModel
            db.run(
                `CREATE TABLE IF NOT EXISTS ${FILTERS_TABLE} (
                    id INTEGER PRIMARY KEY,
                    qty INTEGER NOT NULL,
                    ts INTEGER DEFAULT (strftime('%s', 'now'))
                )`,
                (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                }
            );

            // types.ts - interface TankModel
            db.run(
                `CREATE TABLE IF NOT EXISTS ${TANKS_TABLE} (
                    id INTEGER PRIMARY KEY,
                    qty INTEGER NOT NULL,
                    ts INTEGER DEFAULT (strftime('%s', 'now'))
                )`,
                (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                }
            );

            // types.ts - interface RefrigeratorModel
            db.run(
                `CREATE TABLE IF NOT EXISTS ${REFRIGERATOR_TABLE} (
                    ts INTEGER PRIMARY KEY DEFAULT (strftime('%s', 'now')),
                    temperature REAL,
                    state INTEGER
                ) WITHOUT ROWID`,
                (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                }
            );

            db.run(
                `CREATE VIEW IF NOT EXISTS ${AGGREGATE_DISPENSES_VIEW}(operation_type, duration) AS 
                    SELECT operation_type, SUM(duration)
                    FROM ${DISPENSES_TABLE}
                    WHERE ts > (
                        SELECT coalesce(
                            (
                                SELECT ts
                                FROM ${FILTERS_TABLE}
                                ORDER BY id DESC
                                LIMIT 1
                            ),
                            0
                        )
                    )
                    GROUP BY operation_type
                `,
                (err) => {
                    if (err) {
                        return console.error(err.message);
                    }
                }
            );

            console.log("SQL ready");
        });
    }
);

//////////////////////// DISPENSES ////////////////////////

export const getDispenses = async (): Promise<DispenseModel[]> =>
    new Promise((resolve, reject) =>
        db.all(`SELECT * FROM (
                    SELECT * FROM ${DISPENSES_TABLE} 
                    WHERE strftime('%m-%Y', datetime(ts, 'unixepoch')) = strftime('%m-%Y', datetime())
                    ORDER BY id DESC) sub
                ORDER BY sub.id ASC;`,
            (err, rows) => err ? reject(err) : resolve(rows as DispenseModel[])
        )
    );

export const getAggregateDispenses = async (): Promise<AggregateDispenseModel[]> =>
    new Promise((resolve, reject) =>
        db.all(`SELECT * FROM ${AGGREGATE_DISPENSES_VIEW}`,
            (err, rows) => err ? reject(err) : resolve(rows as AggregateDispenseModel[])
        )
    );

export const insertDispense = async (operation: DispenseOperation, duration: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${DISPENSES_TABLE}(operation_type, duration, qty) VALUES(?, ?, ?);`;
        const qty = duration * operation.factor;
        const values = [
            operation.type, duration, qty ?? null
        ];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log("Inserted new dispense entry:\n", this.lastID);
                resolve();
            }
        });
    });

//////////////////////// FILTERS ////////////////////////

export const getCurrentFilter = async (): Promise<FilterModel> =>
    new Promise((resolve, reject) =>
        db.get(`SELECT * FROM ${FILTERS_TABLE} 
            ORDER BY id DESC
            LIMIT 1;`,
            (err, row) => err ? reject(err) : resolve(row as FilterModel)
        )
    );

export const insertFilter = async (qty: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${FILTERS_TABLE}(qty) VALUES(?)`;
        const values = [qty];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log("Inserted new filter entry:\n", this.lastID);
                revalidatePath("/");
                resolve();
            }
        });
    });

//////////////////////// TANKS ////////////////////////

export const insertTank = async (qty: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${TANKS_TABLE}(qty) VALUES(?)`;
        const values = [qty];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log("Inserted new tank entry:\n", this.lastID);
                revalidatePath("/");
                resolve();
            }
        });
    });

//////////////////////// REFRIGERATOR ////////////////////////

export const getRefrigerators = async (limit?: number): Promise<RefrigeratorModel[]> =>
    new Promise((resolve, reject) =>
        db.all(`SELECT * FROM ${REFRIGERATOR_TABLE} 
            ORDER BY ts DESC
            LIMIT ${limit && limit > 0 ? limit : 1};`,
            (err, rows) => err ? reject(err) : resolve(rows as RefrigeratorModel[])
        )
    );

export const insertRefrigerator = async (temperature: number, state: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${REFRIGERATOR_TABLE}(temperature, state) VALUES(?, ?);`;
        const values = [temperature, state];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else
                resolve();
        });
    });
