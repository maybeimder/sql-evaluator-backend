// app/models/Databases.model.ts
import { robleClient } from "../connection/robleClient";
import crypto from "crypto"

export type DatabaseRegister = {
    DatabaseID: string;
    Name: string;
    Description: string | null;
    DumpFilePath: string;
    UploadedAt: string;
    Tables: number | null;
    Size: number | null;
};

// Crear registro de base de datos en la tabla "Databases" de ROBLE
export async function newDatabase(
    token: string,
    name: string,
    description: string | null = null,
    tables: number | null = null,
    size: number | null = 0,
    databaseID: string,
    dumpFilePath: string
): Promise<DatabaseRegister | null> {
    const now = new Date().toISOString();

    const res = await robleClient().post("/insert", {
        tableName: "Databases",
        records: [{
            Name: name,
            Description: description,
            UploadedAt: now,
            Tables: tables,
            Size: size,
            DatabaseID: databaseID,
            DumpFilePath: dumpFilePath,
        }],
    },
        {
            headers: { Authorization: "Bearer " + token },
        }
    );
    console.log({
        Name: name,
        Description: description,
        UploadedAt: now,
        Tables: tables,
        Size: size,
        DatabaseID: databaseID,
        DumpFilePath: dumpFilePath
    })
    console.log(res)

    return {
        DatabaseID: databaseID,
        Name: name,
        Description: description,
        DumpFilePath: dumpFilePath,
        UploadedAt: now,
        Tables: tables,
        Size: size,
    };
}

// Listar todas las bases de datos
export async function listAllDatabases(
    token: string
): Promise<DatabaseRegister[]> {
    const res = await robleClient().get<Array<DatabaseRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Databases" },
    });

    return res.data ?? [];
}

// Obtener una base de datos por ID
export async function getDatabaseByID(
    token: string,
    databaseID: string
): Promise<DatabaseRegister | null> {
    const res = await robleClient().get<Array<DatabaseRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            tableName: "Databases",
            DatabaseID: databaseID,
        },
    });

    return res.data?.[0] ?? null;
}

export async function deleteDatabase(
    token: string,
    databaseID: string
): Promise<any> {
    const res = await robleClient().delete(
        `/delete`,
        {
            headers: { Authorization: `Bearer ${token}` },
            data: {
                tableName: "Databases",
                idColumn: "DatabaseID",
                idValue: databaseID
            }
        }
    );
    console.log(token)
    console.log(databaseID)
    console.log(res.data)
    return res.data;
}

