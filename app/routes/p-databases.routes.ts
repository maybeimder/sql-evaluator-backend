// app/routes/p-databases.routes.ts

import { Router } from "express";
import multer from "multer";
import * as dpb from "../controllers/p-databases.controller";
import { requireRole } from "../middlewares/roles.middleware";

const upload = multer({ dest: "uploads/" });

const router = Router();

// 🟧 [ POST ] postgres/restore
router.post("/restore", upload.single("file"), dpb.uploadAndRestore);

// 🟧 [ POST ] postgres/delete
router.post("/delete", dpb.deleteDatabaseGeneral);

// 🟧 [ POST ] postgres/query/:databaseID
router.post("/query/:databaseID", dpb.queryDatabase, requireRole("STUDENT"));

// 🟩 [ GET ] postgres/test
router.get("/test", dpb.testDB);

export default router;
