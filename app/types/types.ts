// app/types/types.ts
import type { Request, Response, NextFunction } from "express";
import type { UserCache } from "../cache/userCache";

export type Controller = (
    req   : Request,
    res   : Response,
) => void | Promise<void>;

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
        }
    }
}
