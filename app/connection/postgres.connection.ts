// app/connection/postgres.connection.ts

import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Pool principal (base de datos del sistema)
export const pgPool = new Pool({
    host:     process.env.DB_HOST,
    port:     Number(process.env.DB_PORT),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Cache de pools por base de datos dinámica
const poolCache = new Map<string, Pool>();

export function connectToDB(dbName: string): Pool {
    if (poolCache.has(dbName))
        return poolCache.get(dbName)!;

    const pool = new Pool({
        host:     process.env.DB_HOST,
        port:     Number(process.env.DB_PORT),
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        max:              5,
        idleTimeoutMillis: 30_000,
        connectionTimeoutMillis: 5_000,
    });

    // Si la BD fue eliminada, limpiar su pool del cache
    pool.on("error", (err) => {
        console.error(`[pg] Error en pool de "${dbName}":`, err.message);
        poolCache.delete(dbName);
    });

    poolCache.set(dbName, pool);
    return pool;
}

// Liberar explícitamente un pool (llamar desde dropDatabase)
export async function releaseDB(dbName: string): Promise<void> {
    const pool = poolCache.get(dbName);
    if (pool) {
        await pool.end();
        poolCache.delete(dbName);
    }
}

// Test helper
export async function pgTest() {
    const res = await pgPool.query("SELECT NOW()");
    return res.rows[0];
}