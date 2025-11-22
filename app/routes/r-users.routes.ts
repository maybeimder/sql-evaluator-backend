/* 
Administrauión de usuarios:

    - crear estudiantes
    - crear profesores
    - ver usuarios
    - cambiar roles
    - desautivar usuarios

Tablas utilizadas:
Users, Roles, UserRoles
*/

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

// 🟧 [ POST ] /users/:userID/roles
router.post("/id/:userID/roles", au.editUserRolesByID );

export default router;