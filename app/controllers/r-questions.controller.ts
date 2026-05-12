// app/controllers/r-questions.controller.ts
import type { Controller } from "../types/types";

export const getQuestionsByExamID : Controller = (req, res) => {
  res.json({ message: "Listar preguntas de un examID" });
};

export const createQuestionToExamID : Controller = (req, res) => {
  res.json({ message: "Nueva pregunta para un examID" });
};

export const getQuestionInfoByID : Controller = (req, res) => {
  res.json({ message: "Devuelve el detalle de una pregunta específica." });
};
