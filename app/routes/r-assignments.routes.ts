
// app/routes/r-assignments.routes.js
import { Router } from "express";
import * as aa from "../controllers/r-assignments.controller"

const router = Router();

// 🟧 [ POST ] /assignments
router.post("/", aa.createAssignment );

// 🟩 [ GET ] /assignments/id/:assignmentID
router.get("/id/:assignmentID", aa.searchAssignmentById );

// 🟧 [ POST ] /assignments/id/:assignmentID/start
router.post("/id/:assignmentID/start", aa.startAssignment );

// 🟧 [ POST ] /assignments/id/:assignmentID/sql
router.get("/id/:assignmentID/sql", aa.submitQuery );

// 🟧 [ POST ] /assignments/id/:assignmentID/submit
router.post("/id/:assignmentID/submit", aa.submitAnswer );

// 🟧 [ POST ] /assignments/id/:assignmentID/pseudocode
router.post("/id/:assignmentID/pseudocode", aa.runAndSubmitPseudocode);

// 🟧 [ POST ] /assignments/id/:assignmentID/finish
router.post("/id/:assignmentID/finish", aa.finishAssignment );

// 🟧 [ POST ] /assignments/id/:assignmentID/block
router.get("/id/:assignmentID/block", aa.blockStudent );

// 🟩 [ GET ] /assignments/id/:dbID/answers
router.get("/id/:examID/answers", aa.getAnswersByExamAndStudent );



export default router;