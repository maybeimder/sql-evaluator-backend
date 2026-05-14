// app/controllers/r-assignments.controller.ts
import { connectToDB } from "../connection/postgres.connection";
import { robleClient } from "../connection/robleClient";
import { newAssignment, blockAssignment, startAssignmentStudent, getAssignmentByID, getAssignmentByStudentID } from "../models/Assignments.model";
import type { Controller } from "../types/types";
import { queryDatabase } from "./p-databases.controller";
import { gradeAssignment } from "../utils/Grader";
import { getAttemptsByAssignment, insertAttempt } from "../models/AssignmentAttemps.model";
import { getExamByID } from "../models/Exams.model";
import { getQuestionByID } from "../models/Questions.model";

export const createAssignment: Controller = async (req, res) => {
    const token = req.auth.token;
    const professor = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles.includes(2) && !professor?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para crear asignaciones" });

    const {
        StudentID,
        ExamID,
    } = req.body;

    if (!StudentID || !ExamID)
        return res.status(400).json({ error: "Faltan campos" });

    const newAssignmentRecord = await newAssignment(
        token,
        ExamID,
        StudentID,
    );

    if (!newAssignmentRecord)
        return res.status(500).json({ error: "Error Inesperado creando las asignaciones" });

    return res.status(200).json({ ok: true, assignment: newAssignmentRecord });
};

export const searchAssignmentById: Controller = async (req, res) => {
    const token = req.auth.token;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { id } = req.params;

    if (!id)
        return res.status(400).json({ error: "Falta el ID del assignment" });

    const assignment = await getAssignmentByID(token, id);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    return res.status(200).json({ ok: true, assignment });
};


export const startAssignment: Controller = async (req, res) => {
    const token = req.auth.token;
    const user = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const id = req.params.assignmentID;
    console.log(id)

    if (!id)
        return res.status(400).json({ error: "Falta el ID del assignment" });

    const assignment = await getAssignmentByID(token, id);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (assignment.IsBlocked)
        return res.status(403).json({ error: "El estudiante está bloqueado" });

    if (!assignment.IsActive)
        return res.status(403).json({ error: "El assignment no está activo" });

    if (assignment.StartedAt)
        return res.status(409).json({ error: "El assignment ya fue iniciado" });

    // Solo el propio estudiante puede iniciar su assignment
    if (user?.UserID !== assignment.StudentID && !user?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para iniciar este assignment" });

    const started = await startAssignmentStudent(token, id);

    if (!started)
        return res.status(500).json({ error: "Error inesperado empezando el examen" });

    return res.status(200).json({ ok: true, sessionToken: started.sessionToken, startedAt: started.startedAt });
};


export const submitQuery: Controller = async (req, res) => {
    const token = req.auth.token;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { databaseID } = req.params;
    const { query, assignmentID } = req.body;

    if (!databaseID || !query || !assignmentID)
        return res.status(400).json({ error: "Faltan campos requeridos (databaseID, query, assignmentID)" });

    const assignment = await getAssignmentByID(token, assignmentID);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (assignment.IsBlocked)
        return res.status(403).json({ error: "El estudiante está bloqueado" });

    if (!assignment.StartedAt)
        return res.status(400).json({ error: "El assignment aún no ha sido iniciado" });

    return queryDatabase(req, res);
};

export const submitAnswer: Controller = async (req, res) => {
    const token = req.auth.token;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { assignmentID } = req.params;
    const { questionID, answer } = req.body;

    if (!assignmentID || !questionID || !answer)
        return res.status(400).json({ error: "Faltan campos requeridos (assignmentID, questionID, answer)" });

    const assignment = await getAssignmentByID(token, assignmentID);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (assignment.IsBlocked)
        return res.status(403).json({ error: "El estudiante está bloqueado" });

    if (!assignment.StartedAt)
        return res.status(400).json({ error: "El assignment aún no ha sido iniciado" });

    // Obtener el DatabaseID desde el examen
    const exam = await getExamByID(token, assignment.ExamID);

    if (!exam)
        return res.status(404).json({ error: "Examen no encontrado" });

    if (!exam.DatabaseID)
        return res.status(400).json({ error: "El examen no tiene una base de datos asignada" });

    // Ejecutar la query del estudiante para obtener el output
    const now = new Date().toISOString();
    let answerOutput: object | null = null;
    let errorMessage: string | null = null;

    const MAX_ROWS = 100;

    try {
        const db = connectToDB(exam.DatabaseID);
        const result = await db.query(answer);
        answerOutput = {
            rowCount: result.rowCount,
            fields: result.fields.map((f: { name: string }) => f.name),
            rows: result.rows.slice(0, MAX_ROWS),   // ← limitar rows
            truncated: result.rows.length > MAX_ROWS,     // ← avisar al front
        };
    } catch (err: any) {
        errorMessage = err.message;
    }
    // Después de ejecutar la query del estudiante, comparar con ExpectedOutput
    let isCorrect: boolean | null = null;

    if (answerOutput && !errorMessage) {
        const question = await getQuestionByID(token, questionID);

        // Si ExpectedOutput no está cacheado pero hay SolutionExample, ejecutarlo y cachearlo ahora
        if (!question?.ExpectedOutput && question?.SolutionExample && exam.DatabaseID) {
            try {
                const db = connectToDB(exam.DatabaseID);
                const expectedResult = await db.query(question.SolutionExample);
                const expectedOutput = {
                    rowCount: expectedResult.rowCount,
                    fields: expectedResult.fields.map((f: { name: string }) => f.name),
                    rows: expectedResult.rows.slice(0, MAX_ROWS),
                };

                // Cachear en ExamQuestions para la próxima vez
                await robleClient().put(
                    "/update",
                    {
                        tableName: "ExamQuestions",
                        idColumn: "QuestionID",
                        idValue: questionID,
                        updates: { ExpectedOutput: expectedOutput },
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                // Usar para comparar en este mismo submit
                question.ExpectedOutput = expectedOutput;
            } catch (err: any) {
                console.warn(`[submitAnswer] No se pudo cachear ExpectedOutput: ${err.message}`);
            }
        }

        // Comparar
        if (answerOutput && !errorMessage && question?.ExpectedOutput) {
            const expected = question.ExpectedOutput;
            const student = answerOutput as any;

            // ExpectedOutput puede ser solo un número (rowCount legacy)
            // o el objeto completo { rowCount, fields, rows }
            if (typeof expected === "number") {
                isCorrect = student.rowCount === expected;
            } else {
                const sameRowCount = student.rowCount === expected.rowCount;
                const sameFields = JSON.stringify(student.fields) === JSON.stringify(expected.fields ?? []);
                const sameRows = JSON.stringify(student.rows) === JSON.stringify((expected.rows ?? []).slice(0, MAX_ROWS));
                isCorrect = sameRowCount && sameFields && sameRows;
            }
        }
    }

    // Upsert en StudentAssignmentAnswers
    await robleClient().post(
        "/insert",
        {
            tableName: "StudentAssignmentAnswers",
            records: [{
                AssignmentID: assignmentID,
                QuestionID: questionID,
                Answer: answer,
                AnswerOutput: answerOutput,
                ErrorMessage: errorMessage,
                IsCorrect: isCorrect,       // ← ya calculado
                SubmittedAt: now,
                LastModifiedAt: now,
            }],
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json({
        ok: true,
        submittedAt: now,
        answerOutput,
        errorMessage,
        isCorrect,              // ← el front lo recibe aquí
    });
};

export const finishAssignment: Controller = async (req, res) => {
    const token = req.auth.token;
    const user = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const id = req.params.assignmentID;

    if (!id)
        return res.status(400).json({ error: "Falta el ID del assignment" });

    const assignment = await getAssignmentByID(token, id);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (!assignment.IsActive)
        return res.status(409).json({ error: "El assignment ya fue finalizado" });

    console.log(user?.UserID, assignment.StudentID)
    if (user?.UserID !== assignment.StudentID && !user?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para finalizar este assignment" });

    // Obtener DatabaseID desde el examen
    const exam = await getExamByID(token, assignment.ExamID);

    if (!exam)
        return res.status(404).json({ error: "Examen no encontrado" });

    if (!exam.DatabaseID)
        return res.status(400).json({ error: "El examen no tiene una base de datos asignada" });

    // 1. Calificar todas las respuestas y obtener puntaje
    const score = await gradeAssignment(token, id, assignment.ExamID, exam.DatabaseID);

    // 2. Registrar intento con el puntaje
    const previousAttempts = await getAttemptsByAssignment(token, id);
    const attemptNumber = previousAttempts.length + 1;
    const attempt = await insertAttempt(token, id, score, attemptNumber);

    const now = new Date().toISOString();

    await robleClient().put(
        "/update",
        {
            tableName: "Assignments",
            idColumn: "AssignmentID",
            idValue: id,
            updates: { LastUpdatedAt: now, IsActive: false },
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log()

    return res.status(200).json({
        ok: true,
        attemptNumber,
        score,
        finishedAt: now,
        attempt,
    });
};

export const blockStudent: Controller = async (req, res) => {
    const token = req.auth.token;
    const professor = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles.includes(2) && !professor?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para bloquear estudiantes" });

    const { id } = req.params;

    if (!id)
        return res.status(400).json({ error: "Falta el ID del assignment" });

    const assignment = await getAssignmentByID(token, id);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (assignment.IsBlocked)
        return res.status(409).json({ error: "El estudiante ya está bloqueado" });

    const blocked = await blockAssignment(token, id);

    if (!blocked)
        return res.status(500).json({ error: "Error inesperado bloqueando al estudiante" });

    return res.status(200).json({ ok: true, message: "Estudiante bloqueado correctamente" });
};

export const getAnswersByExamAndStudent: Controller = async (req, res) => {
    const token = req.auth.token;
    const requester = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { examID, studentID } = req.params;

    if (!examID || !studentID)
        return res.status(400).json({ error: "Faltan campos requeridos (examID, studentID)" });

    if (
        requester?.UserID !== studentID &&
        !requester?.Roles.includes(1) &&
        !requester?.Roles.includes(2)
    )
        return res.status(403).json({ error: "No tiene permisos para ver estas respuestas" });

    // Buscar el assignment que corresponde a este estudiante + examen
    const assignments: any[] = await getAssignmentByStudentID(token, studentID);

    const assignment = assignments?.find((a) => a.ExamID === examID);

    if (!assignment)
        return res.status(404).json({ error: "No se encontró un assignment para este estudiante y examen" });

    // Traer las respuestas vinculadas al assignment encontrado
    const answersRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Answers", AssignmentID: assignment.AssignmentID },
    });

    const answers = answersRes.data ?? [];

    return res.status(200).json({ ok: true, assignment, answers });
};