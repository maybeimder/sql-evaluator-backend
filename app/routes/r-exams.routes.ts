
// app/routes/r-exams.routes.js
import { Router } from "express";
import * as ae from "../controllers/r-exams.controller"

const router = Router();

// 🟩 [ GET ] /exams
router.get("/", ae.getExamsList );

// 🟩 [ GET ] /exams/id/:examID
router.get("/id/:examID", ae.getExamInfoByID );
    
// 🟩 [ GET ] /exams/id/:examID/results
router.get("/id/:examID/results", ae.getExamResultsByStudent);

// 🟩 [ GET ] /exams/id/:examID/status
router.get("/id/:examID/status", ae.getExamStatusByID );

// 🟧 [ POST ] /exams
router.post("/", ae.createExam );

// 🟨 [ POST ] /exams/id/:examID
router.post("/id/:examID", ae.updateExamByID );

export default router;