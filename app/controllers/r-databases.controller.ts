// app/controllers/r-databases.controller.ts
import type { Controller } from "../types/types";
import {
    listAllDatabases,
    getDatabaseByID,
    newDatabase,
    deleteDatabase,
} from "../models/Databases.model";
import { deleteDumpFile, dropDatabase } from "../utils/postgres.helper";

// 🟩 [GET] /databases
export const getDatabaseList: Controller = async (req, res) => {
    const token = req.auth?.token;
    const user = req.auth?.user;

    if (!token) {
        return res.status(400).json({ error: "No se pudo validar el token" });
    }

    // Opcional: solo ADMIN (1) o PROFESSOR (2) pueden ver DBs
    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2)) {
        return res.status(403).json({ error: "No tiene permisos para listar bases de datos" });
    }

    try {
        const databases = await listAllDatabases(token);
        return res.json({
            ok: true,
            count: databases.length,
            databases,
        });
    } catch (err: any) {
        console.error("[getDatabaseList] error:", err);
        return res.status(500).json({
            ok: false,
            error: "Error listando bases de datos",
        });
    }
};

// 🟩 [GET] /databases/:databaseID
export const getDatabaseInfoByID: Controller = async (req, res) => {
    const token = req.auth?.token;
    const user = req.auth?.user;

    if (!token) {
        return res.status(400).json({ error: "No se pudo validar el token" });
    }

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2)) {
        return res.status(403).json({ error: "No tiene permisos para ver esta base de datos" });
    }

    const { databaseID } = req.params;

    if (!databaseID) {
        return res.status(400).json({ ok: false, message: "Falta databaseID en la URL" });
    }

    try {
        const db = await getDatabaseByID(token, databaseID);

        if (!db) {
            return res.status(404).json({
                ok: false,
                message: "Base de datos no encontrada",
            });
        }

        return res.json({
            ok: true,
            database: db,
        });
    } catch (err: any) {
        console.error("[getDatabaseInfoByID] error:", err);
        return res.status(500).json({
            ok: false,
            error: "Error consultando base de datos",
        });
    }
};

// 🟧 [POST] /databases
export const registerDatabaseMetadata: Controller = async (req, res) => {
    const token = req.auth?.token;
    const user = req.auth?.user;

    if (!token) {
        return res.status(400).json({ error: "No se pudo validar el token" });
    }

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2)) {
        return res.status(403).json({ error: "No tiene permisos para registrar bases de datos" });
    }

    const {
        databaseID,
        name,
        description,
        dumpFilePath,
        tables,
        size,
    }: {
        databaseID: string;
        name: string;
        description?: string | null;
        dumpFilePath: string;
        tables?: number;
        size?: number | null;
    } = req.body;

    if (!name) {
        return res.status(400).json({
            ok: false,
            message: "El campo 'name' es obligatorio",
        });
    }

    try {
        const db = await newDatabase(
            token,
            name,
            description ?? null,
            tables ?? 0,
            size,
            databaseID,
            dumpFilePath
        );

        if (!db) {
            return res.status(500).json({
                ok: false,
                message: "No se pudo registrar la base de datos en ROBLE",
            });
        }

        return res.status(201).json({
            ok: true,
            database: db,
        });
    } catch (err: any) {
        console.error("[registerDatabaseMetadata] error:", err);
        return res.status(500).json({
            ok: false,
            error: "Error creando registro de base de datos",
        });
    }
};

// 🟥 [DELETE] /databases/delete/:databaseID
export const deleteDatabaseByID: Controller = async (req, res) => {
    const token = req.auth.token;
    const user = req.auth.user;
    const { databaseID } = req.params;

    // 1. Validar token
    if (!token) {
        return res.status(400).json({ error: "No se pudo validar el token" });
    }

    // 2. Validar permisos
    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2)) {
        return res.status(403).json({
            error: "No tiene permisos para eliminar bases de datos",
        });
    }

    // 3. Verificar si la DB existe en Roble
    const db = await getDatabaseByID(token, databaseID);
    if (!db) {
        return res.status(404).json({
            ok: false,
            error: "No existe una base de datos con ese ID",
        });
    }

    const { DatabaseID: dbName, DumpFilePath } = db;

    // 4. Eliminar registro en Roble
    const deleted = await deleteDatabase(token, databaseID);

    // 5. Eliminar base de datos física en homelab
    try {
        await dropDatabase(dbName);
    } catch (err) {
        console.warn("[WARN] No se pudo eliminar la base de datos física:", err);
    }

    try {
        if (DumpFilePath) {
            const dumpName = DumpFilePath.replace("/teacher_uploads/", "");
            await deleteDumpFile(dumpName);
        }
    } catch (err) {
        console.warn("[WARN] No se pudo eliminar el archivo dump:", err);
    }

    return res.json({
        ok: true,
        message: "Base de datos eliminada correctamente",
        deleted,
    });

};


