// app/controllers/p-databases.controller.ts

import { Request, Response } from "express";
import { createDatabase, restoreSQL, restoreTAR, generateDBName, dropDatabase } from "../utils/postgres.helper";
import fs from "fs";
import { connectToDB, pgTest } from "../connection/postgres.connection";
import { newDatabase } from "../models/Databases.model";

export async function uploadAndRestore(req: Request, res: Response) {
    const token = req.auth?.token;
    const professor = req.auth?.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles?.includes(2) && !professor?.Roles?.includes(1))
        return res.status(403).json({ error: "No tiene permisos para crear bases de datos" });

    try {
        if (!req.file)
            return res.status(400).json({ ok: false, message: "No file uploaded" });

        const localPath = req.file.path;       // /app/uploads/archivo.sql
        const fileName  = req.file.originalname;
        const fileSizeBytes = req.file.size ?? 0;

        const baseName = fileName.replace(/\.(sql|tar|backup)$/i, "");

        // 1. Crear base autogenerada en Postgres
        const databaseID = generateDBName();
        await createDatabase(databaseID);

        // 2. Restaurar según extensión usando la ruta local directamente
        if (fileName.endsWith(".sql")) {
            await restoreSQL(databaseID, localPath);
        } else if (fileName.endsWith(".tar") || fileName.endsWith(".backup")) {
            await restoreTAR(databaseID, localPath);
        } else {
            await dropDatabase(databaseID);
            return res.status(400).json({ ok: false, message: "Formato no soportado (.sql, .tar, .backup)" });
        }

        // 3. Eliminar archivo temporal local
        try { fs.unlinkSync(localPath); } catch { }

        // 4. Registrar metadata en ROBLE
        const sizeMB: number = +(fileSizeBytes / (1024 * 1024)).toFixed(2);

        const dbMetadata = await newDatabase(
            token,
            baseName || databaseID,
            `Base restaurada desde ${fileName}`,
            0,
            sizeMB,
            databaseID,
            fileName
        );

        console.log(dbMetadata)

        return res.json({
            ok: true,
            database: databaseID,
            metadata: dbMetadata,
            message: "Database restored and registered successfully!",
        });

    } catch (err: any) {
        console.error("ERROR en uploadAndRestore:", err);
        return res.status(500).json({ ok: false, error: err.message });
    }
}

export async function testDB(req: Request, res: Response) {
    try {
        const result = await pgTest();
        res.json({ ok: true, now: result });
    } catch (err) {
        res.status(500).json({ ok: false, error: err });
    }
}

export async function deleteDatabaseGeneral(req: Request, res: Response) {
    const token = req.auth?.token;
    const professor = req.auth?.user;
    const { databaseID } = req.body;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles?.includes(2) && !professor?.Roles?.includes(1))
        return res.status(403).json({ error: "No tiene permisos para borrar bases de datos" });

    if (!databaseID)
        return res.status(400).json({ error: "Debe indicar el nombre de la base de datos" });

    try {
        await dropDatabase(databaseID);

        return res.json({
            ok: true,
            message: `La base de datos ${databaseID} fue eliminada correctamente`,
        });

    } catch (err: any) {
        return res.status(500).json({ ok: false, error: err.message });
    }
}

export async function queryDatabase(req: Request, res: Response) {
    const token = req.auth?.token;
    const user = req.auth?.user;
    const { databaseID } = req.params;
    const { query } = req.body;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!user?.Roles.includes(1) && !user?.Roles.includes(2))
        return res.status(403).json({ error: "No tiene permisos para consultar esta base" });

    if (!databaseID)
        return res.status(400).json({ error: "Debe indicar databaseID" });

    if (!query)
        return res.status(400).json({ error: "Debe enviar la query en el body" });

    try {
        const db = connectToDB(databaseID);
        const result = await db.query(query);

        return res.json({
            ok: true,
            rowCount: result.rowCount,
            fields: result.fields.map((f: { name: any }) => f.name),
            rows: result.rows,
        });
    } catch (err: any) {
        return res.status(500).json({ ok: false, error: err.message });
    }
}