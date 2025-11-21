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

// app/routes/r-auth.routes.ts
import { Router } from "express";
import * as ac from "../controllers/r-auth.controller"

const router = Router();

// 🟧 [ POST ] /auth/register
router.post("/register", ac.registerUser );

// 🟧 [ POST ] /auth/verify
router.post("/verify", ac.verifyEmail );

// 🟧 [ POST ] /auth/login
router.post("/login", ac.loginUser );

// 🟧 [ POST ] /auth/logout
router.post("/logout", ac.logoutUser );

// 🟧 [ POST ] /auth/refresh-token
router.post("/refresh-token", ac.refreshToken);

/*
     [WIP] Reiniciar Contraseña -> Reset
*/

export default router;