// app/controllers/p-databases.controller.ts

import { Request, Response } from "express";
import { createDatabase, restoreSQL, restoreTAR, generateDBName, dropDatabase } from "../utils/postgres.helper";
import { uploadToHomelab } from "../connection/uploadToHomelab";
import fs from "fs";
import { pgTest } from "../connection/postgres.connection";
import { newDatabase } from "../models/Databases.model";   // 👈 IMPORTANTE

export async function uploadAndRestore(req: Request, res: Response) {
    const token = req.auth?.token;
    const professor = req.auth?.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    // Roles permitidos: ADMIN (1) y PROFESSOR (2)
    if (!professor?.Roles?.includes(2) && !professor?.Roles?.includes(1))
        return res.status(403).json({ error: "No tiene permisos para crear bases de datos" });

    try {
        if (!req.file)
            return res.status(400).json({ ok: false, message: "No file uploaded" });

        const localPath = req.file.path;
        const fileName = req.file.originalname;
        const fileSizeBytes = req.file.size ?? 0;

        // Nombre "bonito" para mostrar al profe (sin extensión)
        const baseName = fileName.replace(/\.(sql|tar|backup)$/i, "");

        // 1. Subir el archivo al Homelab (vía SFTP)
        //    Si tu función devuelve la ruta remota, úsala.
        await uploadToHomelab(localPath, fileName);
        const dumpFilePath = fileName; // o algo como `/teacherUploads/${fileName}` según tu homelab

        // 2. Eliminar archivo temporal local
        try { fs.unlinkSync(localPath); } catch { }

        // 3. Crear base autogenerada en Postgres
        const databaseID = generateDBName();
        await createDatabase(databaseID);

        // 4. Restaurar según extensión
        if (fileName.endsWith(".sql")) {
            await restoreSQL(databaseID, fileName);
        } else if (fileName.endsWith(".tar") || fileName.endsWith(".backup")) {
            await restoreTAR(databaseID, fileName);
        } else {
            return res.status(400).json({ ok: false, message: "Unsupported file format" });
        }

        // 5. Registrar METADATA en ROBLE (tabla Databases)
        const sizeMB : number = +(fileSizeBytes / (1024 * 1024)).toFixed(2);

        const dbMetadata = await newDatabase(
            token,
            baseName || databaseID,                    
            `Base restaurada desde ${fileName}`,   
            0,                                     
            sizeMB,                                 
            databaseID,                                 
            dumpFilePath                           
        );

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
