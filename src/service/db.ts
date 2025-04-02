"use server";

import { revalidatePath } from "next/cache";

import sqlite3 from "sqlite3";

import { DispenseModel, DispenseOperation } from "./types";

const DB = process.env.DB_FILE ?? "water-dispenser.db";
const DISPENSES_TABLE = "dispenses";
const SETTINGS_TABLE = "settings";

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

            // global.ts - interface DispenseModel
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

            console.log("SQL ready");

        });
    }
);

export const getDispenses = async (): Promise<DispenseModel[]> =>
    new Promise((resolve, reject) =>
        db.all(`SELECT * FROM ${DISPENSES_TABLE} 
            WHERE strftime('%m-%Y', datetime(ts, 'unixepoch')) = strftime('%m-%Y', datetime())
            ORDER BY id DESC;`,
            (err, rows) => {
                if (err) reject(err);
                resolve(rows as DispenseModel[]);
            })
    );

export const insertDispense = async (operation: DispenseOperation, duration: number, qty?: number): Promise<void> =>
    new Promise((resolve, reject) => {

        const insertSql = `INSERT INTO ${DISPENSES_TABLE}(operation_type, duration, qty) VALUES(?, ?, ?)`;
        const values = [
            operation.type, duration, qty ?? null
        ];

        db.run(insertSql, values, function (err) {
            if (err) {
                console.error(err.message);
                reject(err);
            } else {
                console.log("Inserted new dispense entry:\n", this.lastID);
                revalidatePath("/stats");
                resolve();
            }
        });
    });
