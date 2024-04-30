import sqlite3 from "sqlite3";

const db = new sqlite3.Database("collection.db");

// Perform a database query to retrieve all items from the "items" table
export const get_items = () =>
    new Promise((resolve, reject) =>
        db.all("SELECT * FROM items", (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        })
    );
