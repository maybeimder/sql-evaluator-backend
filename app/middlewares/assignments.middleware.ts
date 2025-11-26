import { Middleware } from "../types/types";
import { getAssignmentByID } from "../models/Assignments.model";
import { HttpError } from "../utils/errors.helper";


export const requireAssignmentExists: Middleware = async (req, res, next) => {
    const token = req.auth.token;
    const user = req.auth.user;
    const assignmentID = req.params.assignmentID;

    if ( ! token )
        throw new HttpError(401, "Token no disponible");

    if ( ! assignmentID )
        throw new HttpError(400, "Falta assignmentID");

    const assignment = await getAssignmentByID(token, assignmentID);

    if ( ! assignment )
        throw new HttpError(404, "El assignment no existe");

    if ( assignment.UserID !== user?.UserID )
        throw new HttpError(403, "No tienes acceso a este assignment");

    req.assignment = assignment;
    next();
};

export const requireUserIsNotBlocked: Middleware = async (req, res, next) => {
    if (!req.assignment)
        throw new HttpError(500, "El middleware requireAssignmentExists no fue ejecutado");

    if (req.assignment.IsBlocked)
        throw new HttpError(403, "Este assignment está bloqueado");

    next();
};


