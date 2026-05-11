// app/utils/postgres.helper.ts

import { exec } from "child_process";
import { promisify } from "util";
import { pgPool, releaseDB } from "../connection/postgres.connection";

const execAsync = promisify(exec);

// Variables del contenedor de Postgres (mismo servicio del compose)
const PG_HOST     = process.env.DB_HOST     ?? "postgres";
const PG_PORT     = process.env.DB_PORT     ?? "5432";
const PG_USER     = process.env.DB_USER     ?? "postgres";
const PG_PASSWORD = process.env.DB_PASSWORD ?? "";

// PGPASSWORD en el env para que psql/pg_restore no pidan contraseña interactiva
const pgEnv = { ...process.env, PGPASSWORD: PG_PASSWORD };

// ─── Crear base de datos ───────────────────────────────────────────────────────

export async function createDatabase(dbName: string) {
    await pgPool.query(`CREATE DATABASE "${dbName}"`);
}

// ─── Restaurar dump .sql ───────────────────────────────────────────────────────

export async function restoreSQL(dbName: string, dumpPath: string) {
    await execAsync(
        `psql -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d "${dbName}" -f "${dumpPath}"`,
        { env: pgEnv }
    );
}

// ─── Restaurar dump .tar / .backup ────────────────────────────────────────────

export async function restoreTAR(dbName: string, dumpPath: string) {
    await execAsync(
        `pg_restore -h ${PG_HOST} -p ${PG_PORT} -U ${PG_USER} -d "${dbName}" "${dumpPath}"`,
        { env: pgEnv }
    );
}

// ─── Eliminar base de datos ────────────────────────────────────────────────────

export async function dropDatabase(dbName: string) {
    await releaseDB(dbName);
    await pgPool.query(`DROP DATABASE IF EXISTS "${dbName}"`);
}

// ─── Eliminar dump local ───────────────────────────────────────────────────────

import fs from "fs";

export function deleteDumpFile(filePath: string) {
    try { fs.unlinkSync(filePath); } catch { /* ya fue borrado o no existe */ }
}

// ─── Nombre autogenerado ───────────────────────────────────────────────────────

export function generateDBName(): string {
    return `db_${Date.now()}`;
}