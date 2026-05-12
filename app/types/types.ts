// app/types/types.ts
import type { Request, Response, NextFunction } from "express";
import type { UserCache } from "../cache/userCache";
import { AssignmentRegister } from "../models/Assignments.model";

export type Controller = (
    req   : Request,
    res   : Response,
) => Promise<void | Response> | void | Response;

export type Middleware = (
    req   : Request,
    res   : Response,
    next  : NextFunction
) => void | Response | Promise<void | Response>

export interface RobleUser {
    sub       : string;
    email     : string;
    dbName    : string;
    role      : string;
    sessionId : string;
}

declare global {
    namespace Express {
        interface Request {
            auth: {
                roble?: RobleUser;
                user?: UserCache;
                token?: string;
            }
            assignment : AssignmentRegister
        }
    }
}
