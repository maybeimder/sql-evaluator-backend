// app/models/Answers.model.ts
import { robleClient } from "../connection/robleClient";

export type AnswerRegister = {
    StudentAssignmentAnswerID: number,
    AssignmentID: string | null,
    QuestionID: string | null,
    Answer: string | null,
    AnswerOutput: any | null,
    ErrorMessage: string | null,
    IsCorrect: boolean | null,
    SubmittedAt: string | null,
    LastModifiedAt: string | null,
};

// ─── Obtener respuestas por AssignmentID ───────────────────────────────────────

export async function getAnswersByAssignment(
    token: string,
    assignmentID: string
): Promise<AnswerRegister[]> {

    const res = await robleClient().get<AnswerRegister[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "StudentAssignmentAnswers", AssignmentID: assignmentID },
    });

    return res.data ?? [];
}

// ─── Obtener respuesta por AssignmentID + QuestionID ──────────────────────────

export async function getAnswerByAssignmentAndQuestion(
    token: string,
    assignmentID: string,
    questionID: string
): Promise<AnswerRegister | null> {

    const res = await robleClient().get<AnswerRegister[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            tableName: "StudentAssignmentAnswers",
            AssignmentID: assignmentID,
            QuestionID: questionID,
        },
    });

    return res.data?.[0] ?? null;
}

// ─── Insertar respuesta ────────────────────────────────────────────────────────

export async function insertAnswer(
    token: string,
    record: Omit<AnswerRegister, "StudentAssignmentAnswerID">
): Promise<AnswerRegister | null> {

    await robleClient().post(
        "/insert",
        { tableName: "StudentAssignmentAnswers", records: [record] },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return record as AnswerRegister;
}

// ─── Actualizar respuesta existente ───────────────────────────────────────────

export async function updateAnswer(
    token: string,
    studentAssignmentAnswerID: number,
    updates: Partial<Omit<AnswerRegister, "StudentAssignmentAnswerID">>
): Promise<boolean> {

    await robleClient().post(
        "/update",
        {
            tableName: "StudentAssignmentAnswers",
            idColumn: "StudentAssignmentAnswerID",
            idValue: studentAssignmentAnswerID,
            updates,
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return true;
}

// ─── Marcar como correcta/incorrecta ──────────────────────────────────────────

export async function gradeAnswer(
    token: string,
    studentAssignmentAnswerID: number,
    isCorrect: boolean
): Promise<boolean> {

    return updateAnswer(token, studentAssignmentAnswerID, {
        IsCorrect: isCorrect,
        LastModifiedAt: new Date().toISOString(),
    });
}