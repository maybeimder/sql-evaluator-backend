// app/controllers/r-databases.controller.ts
import type { Controller } from "../types/types";
import {
    listAllDatabases,
    getDatabaseByID,
    newDatabase,
    deleteDatabase,
} from "../models/Databases.model";
import { deleteDumpFile, dropDatabase } from "../utils/postgres.helper";
import { connectToDB } from "../connection/postgres.connection";
import { promptOllama } from "../connection/ollama.connection";

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

export const generateExamQuestions: Controller = async (req, res) => {
    const token = req.auth?.token;
    const user = req.auth?.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2))
        return res.status(403).json({ error: "Sin permisos" });

    const { databaseID } = req.params;
    const { quantity = 5, difficulty = "medium" } = req.body;

    const db = connectToDB(databaseID);

    // 1. Extraer esquema
    const schemaResult = await db.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
    `);

    const schema = schemaResult.rows.reduce((acc: any, row: any) => {
        if (!acc[row.table_name]) acc[row.table_name] = [];
        acc[row.table_name].push(`${row.column_name} (${row.data_type})`);
        return acc;
    }, {});

    const schemaText = Object.entries(schema)
        .map(([table, cols]) => `${table}: ${(cols as string[]).join(", ")}`)
        .join("\n");

    const seed = Math.floor(Math.random() * 100000);

    // 2. Prompt
    const prompt = `
You are a SQL exam generator. Given this PostgreSQL schema:

${schemaText}

Generate exactly ${quantity} SQL exam questions with ${difficulty} difficulty.
Use random seed ${seed} to ensure variety in the questions.
Avoid repeating common questions like "list all rows" or "count all records".

STRICT SQL RULES — violations will cause errors:
- If you use SELECT DISTINCT, every column in ORDER BY MUST appear in the SELECT list.
- Do not use columns in ORDER BY that are not selected.
- Use only columns that exist in the schema above.

Respond ONLY with a valid JSON array, no explanation, no markdown, no backticks.
Format:
[
  {
    "QuestionTitle": "short title",
    "QuestionText": "question for the student",
    "SolutionExample": "SELECT ...",
    "Value": 5
  }
]
`;

    // 3. Llamar a Ollama
    const raw = await promptOllama(prompt);

    // 4. Parsear JSON de la respuesta
    const clean = raw.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    // 5. Ejecutar cada SolutionExample y poblar ExpectedOutput
    const questionsWithOutput = await Promise.all(
        questions.map(async (q: any) => {
            let expectedOutput = null;
            let solutionExample = q.SolutionExample;

            // Primer intento
            try {
                const result = await db.query(solutionExample);
                expectedOutput = { rows: result.rowCount, output: result.rows };
            } catch (err: any) {
                // Segundo intento — pedirle a Ollama que corrija la query
                try {
                    const fixPrompt = `
This PostgreSQL query has an error: "${err.message}"

Query: ${solutionExample}

Fix the query so it runs without errors. 
Respond ONLY with the corrected SQL query, no explanation, no markdown, no backticks.
`;
                    const fixedRaw = await promptOllama(fixPrompt);
                    solutionExample = fixedRaw.replace(/```sql|```/g, "").trim();
                    const fixedResult = await db.query(solutionExample);
                    expectedOutput = { rows: fixedResult.rowCount, output: fixedResult.rows };
                } catch (fixErr: any) {
                    console.warn(`[generateExamQuestions] Query irreparable: ${fixErr.message}`);
                }
            }

            return { ...q, SolutionExample: solutionExample, ExpectedOutput: expectedOutput };
        })
    );

    console.log(questionsWithOutput)
    return res.json({ ok: true, questions: questionsWithOutput });
};

export const generateSQLFromQuestion: Controller = async (req, res) => {
    const token = req.auth?.token;
    const user = req.auth?.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2))
        return res.status(403).json({ error: "Sin permisos" });

    const { databaseID } = req.params;
    const { question } = req.body;

    if (!question)
        return res.status(400).json({ error: "Falta el enunciado (question)" });

    // 1. Extraer esquema
    const db = connectToDB(databaseID);
    const schemaResult = await db.query(`
        SELECT table_name, column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
    `);

    const schema = schemaResult.rows.reduce((acc: any, row: any) => {
        if (!acc[row.table_name]) acc[row.table_name] = [];
        acc[row.table_name].push(`${row.column_name} (${row.data_type})`);
        return acc;
    }, {});

    const schemaText = Object.entries(schema)
        .map(([table, cols]) => `${table}: ${(cols as string[]).join(", ")}`)
        .join("\n");

    // 2. Prompt
    const prompt = `
You are a SQL expert. Given this PostgreSQL schema:

${schemaText}

Write a SQL query that answers this question:
"${question}"

Respond ONLY with the raw SQL query, no explanation, no markdown, no backticks.
`;

    // 3. Llamar a Ollama y retornar
    const raw = await promptOllama(prompt);
    const sql = raw.replace(/```sql|```/g, "").trim();

    return res.json({ ok: true, sql });
};


