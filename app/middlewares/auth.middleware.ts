// app/middlewares/auth.middleware.ts
import type { Middleware } from "../types/types";

import { verifyRobleToken } from "../models/Auth.model";
import { loadUserToCache, performTokenRefresh } from "../utils/auth.helper";


import { Request, Response, NextFunction } from "express";
import SessionService from "../services/session.service";
import Logger from "../utils/logger";

/* ================================================================== */

declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}


export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        ok: false,
        message: "No se ha enviado ningún token"
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = SessionService.verifyAccessToken(token);

    if (!decoded) {
      // Token expirado, intentar refrescar
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({
          ok: false,
          message: "Token expirado y no hay refresh token"
        });
      }

      const refreshDecoded = SessionService.verifyRefreshToken(refreshToken);
      if (!refreshDecoded) {
        return res.status(401).json({
          ok: false,
          message: "Refresh token inválido"
        });
      }

      // Generar nuevo access token
      const newAccessToken = SessionService.generateAccessToken({
        UserID: refreshDecoded.UserID,
        email: refreshDecoded.email,
        roles: refreshDecoded.roles
      });

      res.setHeader("X-New-Token", newAccessToken);
      req.user = refreshDecoded;
      req.token = newAccessToken;
      Logger.debug(`Token refrescado automáticamente para usuario ${refreshDecoded.UserID}`);
      return next();
    }

    req.user = decoded;
    req.token = token;
    Logger.debug(`Auth middleware: Usuario ${decoded.UserID} autorizado`);
    next();
  } catch (error) {
    Logger.error("Error en autenticación", error);
    return res.status(500).json({
      ok: false,
      message: "Error interno de autenticación"
    });
  }
}

export function requireRole(roleRequired: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        ok: false,
        message: "Usuario no autenticado"
      });
    }

    const userRoles = req.user.roles || [];
    
    if (!userRoles.includes(roleRequired)) {
      Logger.warn(`Acceso denegado: Usuario ${req.user.UserID} no tiene rol ${roleRequired}`);
      return res.status(403).json({
        ok: false,
        message: `Se requiere rol ${roleRequired}`
      });
    }

    next();
  };
}

