/* 

Administración de dumps y BDs del examen:

    - subir archivos .sql
    - registrar dumps en la tabla Databases
    - llamar al Exam Engine para crear exam_n_db
    - dropear exam_n_db cuando finaliza

Tablas utilizadas:
Databases, Exams
*/

// app/routes/r-databases.routes.js
import { Router } from "express";
import * as ad from "../controllers/r-databases.controller.js"

const router = Router();

// 🟩 [ GET ] /databases
router.get("/", ad.databases_get );

// 🟩 [ GET ] /databases/id/:dbID
router.get("/id/:dbID", ad.id );

// 🟧 [ POST ] /databases
router.post("/", ad.databases_post );


export default router;