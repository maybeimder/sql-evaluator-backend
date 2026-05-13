
// app/routes/r-databases.routes.js
import { Router } from "express";
import * as ad from "../controllers/r-databases.controller"

const router = Router();

// 🟩 [ GET ] /databases
router.get("/", ad.getDatabaseList );

// 🟩 [ GET ] /databases/id/:dbID
router.get("/id/:dbID", ad.getDatabaseInfoByID );

// 🟧 [ POST ] /databases/id/:dbID/generate-questions
router.post("/id/:databaseID/generate-questions", ad.generateExamQuestions);

// 🟧 [ POST ] /databases/id/:databaseID/solve-question
router.post("/id/:databaseID/solve-question", ad.generateSQLFromQuestion);

// 🟧 [ POST ] /databases
router.post("/", ad.registerDatabaseMetadata );

// 🟥 [ DELETE ] /databases/delete/:databaseID
router.delete("/delete/:databaseID", ad.deleteDatabaseByID );


export default router;