// app/controllers/r-questions.controller.ts
import type { Controller } from "../types/types";
import { getQuestionsByExam, getQuestionByID, newQuestions} from "../models/Questions.model";

// Devuelve todas las preguntas asociadas a un examID específico
export const getQuestionsByExamID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const { examID } = req.params;

    const questions = await getQuestionsByExam(token, examID);
    return res.status(201).json({ ok: true, questions });
};

export const createQuestionToExamID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2))
        return res.status(403).json({ error: "Sin permisos para crear preguntas" });

    const { examID } = req.params;
    const { QuestionTitle, QuestionText, ExpectedOutput, SolutionExample, Value } = req.body;

    if (!QuestionTitle)
        return res.status(400).json({ error: "QuestionTitle es obligatorio" });

    const created = await newQuestions(token, [{
        ExamID          : examID,
        QuestionTitle,
        QuestionText    : QuestionText   ?? null,
        ExpectedOutput  : ExpectedOutput ?? null,
        SolutionExample : SolutionExample ?? null,
        Value           : Value          ?? null,
    }]);

    return res.status(201).json({ ok: true, question: created?.[0] });
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