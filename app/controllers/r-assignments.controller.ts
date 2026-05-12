// app/controllers/r-assignments.controller.ts
import { newAssignment } from "../models/Assignments.model";
import type { Controller } from "../types/types";

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

    if ( ! StudentID || ! ExamID )
        return res.status(400).json({ error: "Faltan campos" });

    const newAssignmentRecord = await newAssignment(
        token,
        ExamID,
        StudentID,
    );

    if ( ! newAssignmentRecord)
        return res.status(500).json({ error: "Error Inesperado creando las asignaciones" });

    return res.status(200).json({ ok: true, assignment: newAssignmentRecord });
};

export const searchAssignmentById: Controller = (req, res) => {
    res.json({ message: "Get assignments by examID" });
};

export const startAssignment: Controller = (req, res) => {
    res.json({ message: "Start assignment by id" });
};

export const updateRemainingTime: Controller = (req, res) => {
    res.json({ message: "Get remaining time by id" });
};

export const submitQuery: Controller = (req, res) => {
    res.json({ message: "submit sql query" });
};

export const submitAnswer: Controller = (req, res) => {
    res.json({ message: "Submit an answer to a question" });
};

export const finishAssignment: Controller = (req, res) => {
    res.json({ message: "mark status as finished" });
};

export const blockStudent: Controller = (req, res) => {
    res.json({ message: "block an student" });
};

export const getAnswersByExamAndStudent: Controller = (req, res) => {
    res.json({ message: "Get answers by examID and studentID" });
};