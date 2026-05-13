// app/routes/r-pseudocode.routes.ts
import { Router } from "express";
import { runPseudocode } from "../controllers/r-pseudocode.controller";

const router = Router();

// 🟧 [ POST ] /pseudocode/run
router.post("/run", runPseudocode);

export default router;