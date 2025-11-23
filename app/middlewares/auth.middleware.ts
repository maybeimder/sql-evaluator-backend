// app/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import type { Middleware } from "../types/types";

import { verifyRobleToken, getUserID, getUserRoles, refreshRobleToken } from "../models/Auth.model";
import { getUserCache, setUserCache } from "../cache/userCache";

export const requireAuth: Middleware = async (req, res, next) => {
    try {
        // Leer el token de ROBLE desde la petición
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "[UNAUTHORIZED] No se ha enviado ningun token." })
        }

        // Extraer el token y validarlo con ROBLE
        const token = header.split(" ")[1];
        let verify = await verifyRobleToken(token)

        if (!verify?.valid && verify.expired) {
            const refreshed = await refreshRobleToken(req.cookies?.refreshToken);

            if (!refreshed) {
                return res.status(401).json({ error: "Expirado" })
            }

            // Guardar en cookie dinamicamente los refresh tokens
            res.cookie("refreshToken", refreshed.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                path: "/",
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });

            verify = await verifyRobleToken(refreshed.accessToken);

            if (!verify.valid && !verify.user ) { return res.status(401).json({ error: "No se pudo actualizar el token" }) }
            
            req.newToken = refreshed.accessToken;
        }

        if (!verify?.valid || !verify.user) { return res.status(401).json({ error: "Token inválido o vencido." }) }

        const robleUser = verify.user

        // OPTIMIZACION: Cache de la info
        const cached = getUserCache(robleUser.sub)

        if (cached) {
            req.userCache = cached;
            req.robleUser = robleUser;
            return next();

        } else {
            if (!token) { return res.status(500).json({ error: "token no configurado" }) };
            
            const user = await getUserID(token, robleUser.sub)

            if (!user) { return res.status(403).json({ error: "No se encontró el usuario en el sistema" }) };

            const userRoles = await getUserRoles(token, user?.UserID);
            const roles = Array.isArray(userRoles) ? userRoles.map(r => r.RoleID) : [];

            setUserCache(robleUser.sub, {
                UserID: user?.UserID,
                RobleID: user?.RobleID,
                FullName: user?.FullName,
                Email: user?.Email,
                Roles: roles
            });

            req.userCache = getUserCache(robleUser.sub)!;
            req.robleUser = robleUser;
            return next();

        }

    } catch (e) {
        console.log(e)
    }
}

export const requireRole = (level : "ADMIN" | "PROFESSOR" | "STUDENT"): Middleware => {
    const roleMap = {
        "ADMIN": 1,
        "PROFESSOR": 2,
        "STUDENT": 3
    };

    return async (req, res, next) => {
        try {
            const userCache = req.userCache;

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