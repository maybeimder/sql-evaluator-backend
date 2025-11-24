// app/middlewares/auth.middleware.ts
import type { Middleware } from "../types/types";

import { verifyRobleToken } from "../models/Auth.model";
import { loadUserToCache, performTokenRefresh } from "../utils/auth.helper";

/* ================================================================== */
export const requireAuth: Middleware = async (req, res, next) => {
    try {
        if (!req.auth) req.auth = {};

        // Leer el token de ROBLE desde la petición
        const header = req.headers.authorization;

        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "[UNAUTHORIZED] No se ha enviado ningun token." })
        }

        // Extraer el token y validarlo con ROBLE
        const token = header.replace("Bearer ", "").trim();

        // [1] Validar token principal
        let verify = await verifyRobleToken(token);
        if ( verify?.valid && ! verify.expired ){ req.auth.token = token }

        // [2] Si está expirado -> refrescarlo
        if ( ! verify?.valid && verify.expired) {
            const refreshed = await performTokenRefresh( req.cookies?.refreshToken, res );

            if ( ! refreshed ) {
                return res.status(401).json({ error: "Token Expirado y no refrescable" })
            }

            // Reemplazar los datos del token
            req.auth.token = refreshed.newToken;

            verify = {
                valid: true,
                expired: false,
                user: refreshed.user
            };
        }

        // [3] Si es inválido
        if ( ! verify?.valid || ! verify.user ){return res.status(401).json({error:"Token inválido"})};

        const robleUser = verify.user

        // [4] Bajar el cache (si existe)
        const cache = await loadUserToCache(req.auth.token || token, robleUser);
        if ( ! cache ){return res.status(401).json({error:"Token inválido o vencido."})};

        // [5] Inyectar en req
        req.auth.roble = robleUser; 
        req.auth.user = cache;

        return next();

    } catch (e) {
        return res.status(500).json({ error: "Error interno del servidor." });
    }
}

