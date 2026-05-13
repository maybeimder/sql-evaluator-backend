// app/models/AssignmentAttempts.model.ts
import { robleClient } from "../connection/robleClient";

export type AttemptRegister = {
    AttemptID      : string,
    AssignmentID   : string,
    AttemptNumber  : number,
    SubmittedAt    : string,
    Score          : number,
};

// ─── Obtener intentos por AssignmentID ────────────────────────────────────────

export async function getAttemptsByAssignment(
    token: string,
    assignmentID: string
): Promise<AttemptRegister[]> {

    const res = await robleClient().get<AttemptRegister[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "AssignmentAttempts", AssignmentID: assignmentID },
    });

    return res.data ?? [];
}

// ─── Obtener último número de intento ────────────────────────────────────────
// Usado para autoincrementar AttemptNumber

export async function getLastAttemptNumber(
    token: string,
    assignmentID: string
): Promise<number> {

    const attempts = await getAttemptsByAssignment(token, assignmentID);

    if (attempts.length === 0) return 0;

    return Math.max(...attempts.map(a => a.AttemptNumber));
}

// ─── Insertar nuevo intento ───────────────────────────────────────────────────

export async function insertAttempt(
    token: string,
    assignmentID: string,
    score: number,
    attemptNumber: number,
): Promise<AttemptRegister> {

    const now = new Date().toISOString();

    const record: AttemptRegister = {
        AttemptID    : crypto.randomUUID(),
        AssignmentID : assignmentID,
        AttemptNumber: attemptNumber,
        SubmittedAt  : now,
        Score        : score,
    };

    await robleClient().post(
        "/insert",
        { tableName: "AssignmentAttempts", records: [record] },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return record;
}

// ─── Mejor puntaje de un assignment ──────────────────────────────────────────

export async function getBestScore(
    token: string,
    assignmentID: string
): Promise<number> {

    const attempts = await getAttemptsByAssignment(token, assignmentID);

    if (attempts.length === 0) return 0;

    return Math.max(...attempts.map(a => a.Score));
}