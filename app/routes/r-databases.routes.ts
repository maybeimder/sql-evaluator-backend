
// app/routes/r-databases.routes.js
import { Router } from "express";
import * as ad from "../controllers/r-databases.controller"

const router = Router();

// 🟩 [ GET ] /databases
router.get("/", ad.getDatabaseList );

// 🟩 [ GET ] /databases/id/:dbID
router.get("/id/:dbID", ad.getDatabaseInfoByID );

// 🟧 [ POST ] /databases
router.post("/", ad.registerDatabaseMetadata );

// 🟧 [ POST ] /databases/delete/:databaseID
router.delete("/delete/:databaseID", ad.deleteDatabaseByID );


export default router;