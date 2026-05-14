
// app/routes/r-users.routes.js
import { Router } from "express";
import * as au from "../controllers/r-users.controller"

const router = Router();

// 🟩 [ GET ] /users
router.get("/", au.getUserList );

// 🟩 [ GET ] /users/id/:userID
router.get("/id/:userID", au.getUserByID );

// 🟧 [ POST ] /users
router.post("/", au.createUser );

// 🟩 [ GET ] /users/roles/:roleID
router.get("/roles/:roleID", au.getUserListWithRole );

// 🟧 [ POST ] /users/:userID/roles
router.post("/id/:userID/roles", au.editUserRolesByID );

// 🟩 [ GET ] /users/me/average
router.get("/me/average", au.getStudentAverage);

// 🟩 [ GET ] /users/id/:studentID/history
router.get("/id/:studentID/history", au.getStudentExamHistory);

export default router;