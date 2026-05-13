// app/middlewares/ai-logger.middleware.ts

import { Request, Response, NextFunction } from "express";
import Logger from "../utils/logger";
import fs from "fs";
import path from "path";

/**
 * Middleware para registrar todas las operaciones de IA
 */

const LOG_DIR = process.env.LOG_DIR || "./logs";
const AI_LOG_FILE = path.join(LOG_DIR, "ai-operations.log");

// Crear directorio de logs si no existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export function aiLoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  
  // Registrar respuesta
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Log de operación de IA
    if (req.path.startsWith("/ai/")) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        status: res.statusCode,
        request: req.body,
        response: data,
        duration: `${Date.now() - (req as any).startTime}ms`
      };

      // Guardar en archivo
      fs.appendFileSync(
        AI_LOG_FILE,
        JSON.stringify(logEntry) + "\n"
      );

      // Log en consola
      if (res.statusCode === 200) {
        Logger.success(`✅ AI Operation: ${req.method} ${req.path}`);
      } else {
        Logger.error(`❌ AI Operation Failed: ${req.method} ${req.path} [${res.statusCode}]`);
      }
    }

    return originalJson.call(this, data);
  };

  // Guardar tiempo de inicio
  (req as any).startTime = Date.now();
  
  next();
}

/**
 * Función para leer logs de IA
 */
export function getAILogs(limit: number = 100): any[] {
  try {
    if (!fs.existsSync(AI_LOG_FILE)) {
      return [];
    }

    const logs = fs.readFileSync(AI_LOG_FILE, "utf-8")
      .split("\n")
      .filter(line => line.trim())
      .map(line => JSON.parse(line))
      .slice(-limit);

    return logs;
  } catch (error) {
    Logger.error("Error leyendo AI logs", error);
    return [];
  }
}

/**
 * Función para limpiar logs antiguos
 */
export function clearAILogs(): boolean {
  try {
    if (fs.existsSync(AI_LOG_FILE)) {
      fs.unlinkSync(AI_LOG_FILE);
      Logger.info("✅ AI logs limpios");
      return true;
    }
    return false;
  } catch (error) {
    Logger.error("Error limpiando AI logs", error);
    return false;
  }
}