// app/utils/grader.ts
import { connectToDB } from "../connection/postgres.connection";
import { robleClient } from "../connection/robleClient";
import { getAnswersByAssignment, updateAnswer } from "../models/Answers.model";
import { getQuestionsByExam } from "../models/Questions.model";
import type { AnswerRegister } from "../models/Answers.model";
import type { QuestionRegister } from "../models/Questions.model";

// ─── Comparar dos outputs ─────────────────────────────────────────────────────
// Comparación estricta en cascada — orden de filas importa

function compareOutputs(studentOutput: any, expectedOutput: any): boolean {

    // 1. Ambos deben existir
    if (!studentOutput || !expectedOutput) return false;

    // 2. rowCount
    if (studentOutput.rowCount !== expectedOutput.rowCount) return false;

    // 3. Columnas (mismo set, mismo orden)
    const studentFields  = studentOutput.fields  ?? [];
    const expectedFields = expectedOutput.fields ?? [];

    if (studentFields.length !== expectedFields.length) return false;

    for (let i = 0; i < expectedFields.length; i++) {
        if (studentFields[i] !== expectedFields[i]) return false;
    }

    // 4. Filas — posición a posición, valor a valor
    const studentRows  = studentOutput.rows  ?? [];
    const expectedRows = expectedOutput.rows ?? [];

    for (let i = 0; i < expectedRows.length; i++) {
        const sRow = studentRows[i];
        const eRow = expectedRows[i];

        for (const key of Object.keys(eRow)) {
            // Comparación como string para evitar problemas de tipo (number vs string)
            if (String(sRow?.[key]) !== String(eRow[key])) return false;
        }
    }

    return true;
}

// ─── Ejecutar query y formatear output ────────────────────────────────────────

async function executeAndFormat(databaseID: string, sql: string) {
    const db     = connectToDB(databaseID);
    const result = await db.query(sql);

    return {
        rowCount : result.rowCount,
        fields   : result.fields.map((f: { name: string }) => f.name),
        rows     : result.rows,
    };
}

// ─── Cachear ExpectedOutput en la pregunta si aún no existe ──────────────────

async function getOrCacheExpectedOutput(
    token: string,
    question: QuestionRegister,
    databaseID: string,
): Promise<any> {

    // Si ya está cacheado, devolverlo directo
    if (question.ExpectedOutput) return question.ExpectedOutput;

    // Si no, ejecutar SolutionExample y cachear
    if (!question.SolutionExample)
        throw new Error(`Pregunta ${question.QuestionID} no tiene SolutionExample`);

    const expectedOutput = await executeAndFormat(databaseID, question.SolutionExample);

    // Guardar en ExamQuestions para las próximas entregas
    await robleClient().post(
        "/update",
        {
            tableName : "ExamQuestions",
            idColumn  : "QuestionID",
            idValue   : question.QuestionID,
            updates   : { ExpectedOutput: expectedOutput },
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return expectedOutput;
}

// ─── Calificar un assignment completo ────────────────────────────────────────
// Retorna el puntaje total obtenido

export async function gradeAssignment(
    token: string,
    assignmentID: string,
    examID: string,
    databaseID: string,
): Promise<number> {

    const [answers, questions] = await Promise.all([
        getAnswersByAssignment(token, assignmentID),
        getQuestionsByExam(token, examID),
    ]);

    // Mapa questionID → pregunta para acceso rápido
    const questionMap = new Map<string, QuestionRegister>(
        questions.map(q => [q.QuestionID, q])
    );

    let totalScore = 0;

    for (const answer of answers) {
        if (!answer.QuestionID) continue;

        const question = questionMap.get(answer.QuestionID);
        if (!question) continue;

        let isCorrect = false;

        try {
            const expectedOutput = await getOrCacheExpectedOutput(token, question, databaseID);
            isCorrect = compareOutputs(answer.AnswerOutput, expectedOutput);
        } catch (err) {
            console.warn(`[grader] Error comparando pregunta ${answer.QuestionID}:`, err);
            isCorrect = false;
        }

        // Actualizar IsCorrect en StudentAssignmentAnswers
        if (answer.StudentAssignmentAnswerID) {
            await updateAnswer(token, answer.StudentAssignmentAnswerID, {
                IsCorrect      : isCorrect,
                LastModifiedAt : new Date().toISOString(),
            });
        }

        if (isCorrect && question.Value)
            totalScore += question.Value;
    }

    return totalScore;
}