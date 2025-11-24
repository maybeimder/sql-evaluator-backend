// app/middlewares/auth.middleware.ts
import type { Middleware } from "../types/types";

/* ================================================================== */
export const requireRole = (level : "ADMIN" | "PROFESSOR" | "STUDENT"): Middleware => {
    const roleMap = {
        "ADMIN"       : 1,
        "PROFESSOR"   : 2,
        "STUDENT"     : 3
    };

    return async (req, res, next) => {
        try {
            const userCache = req.auth.user;

            if (!userCache) {
                return res.status(500).json({ error: "User cache no disponible." });
            }

            if (!userCache.Roles.includes(1) && !userCache.Roles.includes(roleMap[level])) {
                return res.status(403).json({ error: "No tienes permiso para acceder a este recurso." });
            }

            return next();

        } catch (e) {
            console.log(e);
            return res.status(500).json({ error: "Error del servidor." });
        }
    }
}