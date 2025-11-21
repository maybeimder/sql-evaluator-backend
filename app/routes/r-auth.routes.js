/* 
Todo lo relacionado con autenticación:

    - login
    - logout
    - refresh tokens
    - validación por email (token de emails table)
    - bloqueo de múltiples sesiones
    - seguridad del profesor (token enviado al correo)

Tablas utilizadas:
Users, UserRoles, Emails, AuditLogs
*/

// app/routes/r-auth.routes.js
import { Router } from "express";
import * as ac from "../controllers/r-auth.controller.js"

const router = Router();

// 🟧 [ POST ] /auth/register
router.post("/register", ac.register );

// 🟧 [ POST ] /auth/verify
router.post("/verify", ac.verify);

// 🟧 [ POST ] /auth/login
router.post("/login", ac.login);

// 🟧 [ POST ] /auth/logout
router.post("/logout", ac.logout);

// 🟧 [ POST ] /auth/refresh-token
router.post("/refresh-tkn", ac.refreshToken);

/*
     [WIP] Reiniciar Contraseña -> Reset
*/

export default router;