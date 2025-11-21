/* 
Gestión completa del examen:

    - crear examen
    - editar examen
    - activar/desactivar examen
    - tiempos (StartTime, EndTime)
    - asignación de BD
    - ver listado de exámenes

Tablas utilizadas:
Exams, ExamQuestions, exams
*/

// app/routes/r-exams.routes.js
import { Router } from "express";
import * as ae from "../controllers/r-exams.controller.js"

const router = Router();

// 🟩 [ GET ] /exams
router.get("/", ae.exams_get );

// 🟩 [ GET ] /exams/id/:dbID
router.get("/id/:examID", ae.id );

// 🟩 [ GET ] /exams/id/:dbID/status
router.get("/id/:examID/status", ae.status );

// 🟧 [ POST ] /exams
router.post("/", ae.exams_post );


export default router;