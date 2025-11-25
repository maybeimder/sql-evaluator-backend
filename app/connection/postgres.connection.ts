// app/connection/postgres.connection.ts

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pgPool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Test helper
export async function pgTest() {
    const res = await pgPool.query("SELECT NOW()");
    return res.rows[0];
}
