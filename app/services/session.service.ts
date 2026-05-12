// app/services/session.service.ts

import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { JWT_CONFIG } from "../config/config";

export class SessionService {
  /**
   * Generar Access Token (corta duración)
   */
  static generateAccessToken(payload: any): string {
    return jwt.sign(payload, JWT_CONFIG.secret as Secret, {
      expiresIn: JWT_CONFIG.expiresIn as SignOptions["expiresIn"]
    });
  }

  /**
   * Generar Refresh Token (larga duración)
   */
  static generateRefreshToken(payload: any): string {
    return jwt.sign(payload, JWT_CONFIG.refreshSecret as Secret, {
      expiresIn: JWT_CONFIG.refreshExpiresIn as SignOptions["expiresIn"]
    });
  }

  /**
   * Verificar Access Token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, JWT_CONFIG.secret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Verificar Refresh Token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, JWT_CONFIG.refreshSecret);
    } catch (error) {
      return null;
    }
  }

  /**
   * Crear sesión completa (access + refresh)
   */
  static createSession(userPayload: any) {
    return {
      accessToken: this.generateAccessToken(userPayload),
      refreshToken: this.generateRefreshToken(userPayload),
      expiresIn: JWT_CONFIG.expiresIn
    };
  }
}

export default SessionService;