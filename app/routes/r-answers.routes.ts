// app/routes/r-answers.routes.ts
import { Router } from "express";
import * as aa from "../controllers/r-answers.controller";

const router = Router();

// 🟩 [ GET ] /answers/assignment/:assignmentID
router.get("/assignment/:assignmentID", aa.getAnswersByAssignmentID);

// 🟩 [ GET ] /answers/assignment/:assignmentID/question/:questionID
router.get("/assignment/:assignmentID/question/:questionID", aa.getAnswerByAssignmentAndQuestionID);

// 🟧 [ PATCH ] /answers/:studentAssignmentAnswerID/grade
router.patch("/:studentAssignmentAnswerID/grade", aa.gradeAnswerByID);

export default router;