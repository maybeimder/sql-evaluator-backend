// app/routes/r-attempts.routes.ts
import { Router } from "express";
import * as at from "../controllers/r-attemps.controller";

const router = Router();

// 🟩 [ GET ] /attempts/assignment/:assignmentID
router.get("/assignment/:assignmentID", at.getAttemptsByAssignmentID);

// 🟩 [ GET ] /attempts/assignment/:assignmentID/score
router.get("/assignment/:assignmentID/score", at.getScoreByAssignmentID);

export default router;