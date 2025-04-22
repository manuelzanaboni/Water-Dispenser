"use server";

import sqlite3 from "sqlite3";

import { revalidatePath } from "next/cache";

import { DispenseModel, DispenseOperation, FilterModel, RefrigeratorModel } from "@/service/types";

const DB = process.env.DB_FILE ?? "water-dispenser.db";
const DISPENSES_TABLE = "dispenses";
const FILTERS_TABLE = "filters";
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
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows as DispenseModel[]);
            })
    );

export const insertDispense = async (operation: DispenseOperation, duration: number, qty?: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${DISPENSES_TABLE}(operation_type, duration, qty) VALUES(?, ?, ?);`;
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

export const getLastFilterCapacity = async (): Promise<number> =>
    new Promise((resolve, reject) => {

        db.get(`SELECT * FROM ${FILTERS_TABLE} 
            ORDER BY id DESC
            LIMIT 1;`,
            (err, row) =>
                err ? reject(err) : row === undefined ? resolve(-1) : resolve((row as FilterModel).qty)
        )
    });

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

//////////////////////// REFRIGERATOR ////////////////////////

export const getRefrigerators = async (limit?: number): Promise<RefrigeratorModel[]> =>
    new Promise((resolve, reject) =>
        db.all(`SELECT * FROM ${REFRIGERATOR_TABLE} 
            ORDER BY ts DESC
            LIMIT ${limit && limit > 0 ? limit : 1};`,
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows as RefrigeratorModel[]);
            })
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
