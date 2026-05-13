// app/controllers/r-questions.controller.ts
import type { Controller } from "../types/types";
import { getQuestionsByExam, getQuestionByID } from "../models/Questions.model";

// Devuelve todas las preguntas asociadas a un examID específico
export const getQuestionsByExamID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const { examID } = req.params;

    const questions = await getQuestionsByExam(token, examID);
    return res.json(questions);
};

export const createQuestionToExamID: Controller = (req, res) => {
    res.json({ message: "Nueva pregunta para un examID" });
};

// Devuelve la información completa de una pregunta específica por su ID
export const getQuestionInfoByID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const { questionID } = req.params;

    const question = await getQuestionByID(token, questionID);

    if (!question) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    return res.json(question);
};

// Devuelve solo la solución esperada de una pregunta específica por su ID
export const getExpectedSolutionByID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const { questionID } = req.params;

    const question = await getQuestionByID(token, questionID);

    if (!question) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
    }

    return res.json({
        QuestionID      : question.QuestionID,
        ExpectedOutput  : question.ExpectedOutput,
        SolutionExample : question.SolutionExample,
    });
};