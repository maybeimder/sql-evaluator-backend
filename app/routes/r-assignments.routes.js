/* 

Incluye TODA la gestión operativa del estudiante:

    - asignar estudiante a examen
    - leer / cerrar / bloquear sesión
    - enviar SQL a exam-engine
    - recibir output
    - actualizar respuesta
    - bloquear por múltiples logins
    - mostrar tiempo restante

Tablas utilizadas:
Assignments, StudentAssignmentAnswers, AuditLogs
*/

// app/routes/r-assignments.routes.js
import { Router } from "express";
import * as aa from "../controllers/r-assignments.controller.js"

const router = Router();

// 🟧 [ POST ] /assignments
router.post("/", aa.assignments );

// 🟩 [ GET ] /assignments/id/:assignmentID
router.get("/id/:assignmentID", aa.id );

// 🟧 [ POST ] /assignments/id/:assignmentID/start
router.get("/id/:assignmentID/start", aa.start );

// 🟧 [ POST ] /assignments/id/:assignmentID/uptime
router.get("/id/:assignmentID/uptime", aa.uptime );

// 🟧 [ POST ] /assignments/id/:assignmentID/sql
router.get("/id/:assignmentID/sql", aa.sql );

// 🟧 [ POST ] /assignments/id/:assignmentID/submit
router.get("/id/:assignmentID/submit", aa.submit );

// 🟧 [ POST ] /assignments/id/:assignmentID/finish
router.get("/id/:assignmentID/finish", aa.finish );

// 🟧 [ POST ] /assignments/id/:assignmentID/block
router.get("/id/:assignmentID/block", aa.block );

// 🟩 [ GET ] /assignments/id/:dbID/answers
router.get("/id/:examID/answers", aa.answers );



export default router;