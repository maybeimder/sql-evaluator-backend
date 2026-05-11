// app/controllers/r-assignments.controller.ts
import { connectToDB } from "../connection/postgres.connection";
import { robleClient } from "../connection/robleClient";
import { newAssignment, blockAssignment, startAssignmentStudent, getAssignmentByID, getAssignmentByStudentID } from "../models/Assignments.model";
import { getExamByID } from "../models/Exams.model";
import type { Controller } from "../types/types";
import { queryDatabase } from "./p-databases.controller";

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

    const { id } = req.params;

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
 
    try {
        const db = connectToDB(exam.DatabaseID);
        const result = await db.query(answer);
        answerOutput = {
            rowCount: result.rowCount,
            fields:   result.fields.map((f: { name: string }) => f.name),
            rows:     result.rows,
        };
    } catch (err: any) {
        errorMessage = err.message;
    }
 
    // Upsert en StudentAssignmentAnswers
    await robleClient().post(
        "/insert",
        {
            tableName: "StudentAssignmentAnswers",
            record: {
                AssignmentID:  assignmentID,
                QuestionID:    questionID,
                Answer:        answer,
                AnswerOutput:  answerOutput,
                ErrorMessage:  errorMessage,
                IsCorrect:     null,
                SubmittedAt:   now,
                LastModifiedAt: now,
            },
            conflictColumns: ["AssignmentID", "QuestionID"],
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
 
    return res.status(200).json({
        ok: true,
        submittedAt: now,
        answerOutput,
        errorMessage,
    });
};

export const finishAssignment: Controller = async (req, res) => {
    const token = req.auth.token;
    const user = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { id } = req.params;

    if (!id)
        return res.status(400).json({ error: "Falta el ID del assignment" });

    const assignment = await getAssignmentByID(token, id);

    if (!assignment)
        return res.status(404).json({ error: "Assignment no encontrado" });

    if (!assignment.IsActive)
        return res.status(409).json({ error: "El assignment ya fue finalizado" });

    // Solo el propio estudiante o un admin pueden finalizar
    if (user?.UserID !== assignment.StudentID && !user?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para finalizar este assignment" });

    const now = new Date().toISOString();

    await robleClient().post(
        "/update",
        {
            tableName: "Assignments",
            idColumn: "AssignmentID",
            idValue: id,
            updates: { IsActive: false, LastUpdatedAt: now },
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.status(200).json({ ok: true, finishedAt: now });
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