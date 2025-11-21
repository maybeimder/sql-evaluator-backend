/* 

Gestión de preguntas dentro de un examen:

    - crear preguntas
    - editar preguntas
    - eliminar preguntas
    - obtener preguntas del examen
    - expected output JSON

Tablas utilizadas:
ExamQuestions, Exams
*/

// app/routes/r-questions.routes.ts
import { Router } from "express";
import * as aq from "../controllers/r-questions.controller"

const router = Router();

// 🟩 [ GET ] /exams/id/:id/questions
router.get("/id/:examID/questions", aq.getQuestionsByExamID );

// 🟧 [ POST ] /exams/id/:id/questions
router.post("/id/:examID/questions", aq.createQuestionToExamID );

// 🟩 [ GET ] /questions/id/:questionID
router.get("/id/:questionID", aq.getQuestionInfoByID );

export default router;