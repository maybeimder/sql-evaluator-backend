// app/middlewares/auth.middleware.ts
import type { Middleware } from "../types/types";

/*
    Verifica que:
    - el assignment existe
    - pertenece al estudiante
    - no está bloqueado
    - el examen no ha terminado
*/

export const requireAssignmentAccess : Middleware = ( req, res, next ) => { }