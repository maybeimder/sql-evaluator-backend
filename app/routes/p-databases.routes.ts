// app/routes/p-databases.routes.ts

import { Router } from "express";
import multer from "multer";
import * as dpb from "../controllers/p-databases.controller";

const upload = multer({ dest: "uploads/" });

const router = Router();

// 🟧 [ POST ] postgres/restore
router.post("/restore", upload.single("file"), dpb.uploadAndRestore);

// 🟧 [ POST ] postgres/delete
router.post("/delete", dpb.deleteDatabaseGeneral);

// 🟩 [ GET ] postgres/test
router.get("/test", dpb.testDB);

export default router;
