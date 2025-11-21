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

// app/routes/r-questions.routes.js
import { Router } from "express";
import * as aq from "../controllers/r-questions.controller.js"

const router = Router();

// 🟩 [ GET ] /exams/id/:id/questions
router.get("/id/:examID/questions", aq.questions_get );

// 🟧 [ POST ] /exams/id/:id/questions
router.post("/id/:examID/questions", aq.questions_post );

// 🟩 [ GET ] /questions/id/:questionID
router.get("/id/:questionID", aq.id );

export default router;