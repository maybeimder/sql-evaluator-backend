// app/types/types.ts
import type { Request, Response, NextFunction } from "express";

export type Controller = ( 
    req   : Request,
    res   : Response,
) => void | Promise<void>;

export type Middleware = ( 
    req   : Request,
    res   : Response,
    next  : NextFunction
) => void | Promise<void> | Promise<Response> | Response;