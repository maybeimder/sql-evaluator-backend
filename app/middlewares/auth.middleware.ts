// app/middlewares/auth.middleware.ts
import jwt from "jsonwebtoken";
import type { Middleware } from "../types/types";

export const requireAuth : Middleware = ( req, res, next ) => { 
    try {
        const header = req.headers.authorization;

        if ( ! header || ! header.startsWith("Bearer ") ){
            return res.status(401).json({ error : "[UNAUTHORIZED] No se ha enviado ningun token"})
        }

        const token = header.split(" ")[1];

    } catch (e) {
        console.log(e)
    }
}