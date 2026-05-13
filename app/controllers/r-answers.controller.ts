// app/controllers/r-answers.controller.ts
import type { Controller } from "../types/types";
import {
    getAnswersByAssignment,
    getAnswerByAssignmentAndQuestion,
    gradeAnswer,
} from "../models/Answers.model";

// Todas las respuestas de un assignment
export const getAnswersByAssignmentID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;
    const { assignmentID } = req.params;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2) && user?.UserID !== assignmentID)
        return res.status(403).json({ error: "Sin permisos para ver estas respuestas" });

    const answers = await getAnswersByAssignment(token, assignmentID);
    return res.json({ ok: true, count: answers.length, answers });
};

// Respuesta específica de una pregunta dentro de un assignment
export const getAnswerByAssignmentAndQuestionID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;
    const { assignmentID, questionID } = req.params;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2) && user?.UserID !== assignmentID)
        return res.status(403).json({ error: "Sin permisos para ver esta respuesta" });

    const answer = await getAnswerByAssignmentAndQuestion(token, assignmentID, questionID);

    if (!answer)
        return res.status(404).json({ error: "Respuesta no encontrada" });

    return res.json({ ok: true, answer });
};

// Marcar una respuesta como correcta o incorrecta (solo profesor/admin)
export const gradeAnswerByID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;
    const { studentAssignmentAnswerID } = req.params;
    const { isCorrect } = req.body;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2))
        return res.status(403).json({ error: "Solo profesores pueden calificar respuestas" });

    if (isCorrect === undefined)
        return res.status(400).json({ error: "Falta el campo isCorrect (true/false)" });

    await gradeAnswer(token, Number(studentAssignmentAnswerID), isCorrect);

    return res.json({ ok: true, graded: { studentAssignmentAnswerID, isCorrect } });
};