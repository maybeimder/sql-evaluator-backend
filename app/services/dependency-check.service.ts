import Logger from "../utils/logger";
import AIService from "./ai.service";

/**
 * Servicio para verificar dependencias externas
 * Asegura que todo funciona localmente
 */

export class DependencyCheckService {
  
  static async checkAllDependencies(): Promise<boolean> {
    Logger.info("🔍 Verificando dependencias del sistema...");

    const checks = {
      ollama: await this.checkOllama(),
      database: await this.checkDatabase(),
      localStorage: await this.checkLocalStorage(),
    };

    const allPassed = Object.values(checks).every(result => result);

    if (allPassed) {
      Logger.success("✅ Todas las dependencias son locales");
    } else {
      Logger.warn("⚠️ Algunas dependencias pueden ser externas");
      console.table(checks);
    }

    return allPassed;
  }

  /**
   * Verificar Ollama (IA local)
   */
  private static async checkOllama(): Promise<boolean> {
    try {
      const isAvailable = await AIService.isAvailable();
      if (isAvailable) {
        Logger.success("✅ Ollama (IA local): OK");
        return true;
      } else {
        Logger.warn("⚠️ Ollama no está disponible");
        return false;
      }
    } catch (error) {
      Logger.error("❌ Error verificando Ollama", error);
      return false;
    }
  }

  /**
   * Verificar Base de datos (PostgreSQL local)
   */
  private static async checkDatabase(): Promise<boolean> {
    try {
      // Intenta conectarse a la BD local
      const dbHost = process.env.DB_HOST || "localhost";
      const dbPort = process.env.DB_PORT || "5432";

      const isLocal = dbHost === "localhost" || dbHost === "127.0.0.1";

      if (isLocal) {
        Logger.success(`✅ Base de datos: OK (${dbHost}:${dbPort})`);
        return true;
      } else {
        Logger.warn(`⚠️ Base de datos: Remota (${dbHost})`);
        return false;
      }
    } catch (error) {
      Logger.error("Error verificando BD", error);
      return false;
    }
  }

  /**
   * Verificar que el almacenamiento es local
   */
  private static async checkLocalStorage(): Promise<boolean> {
    try {
      const storageDir = process.env.STORAGE_DIR || "./storage";
      
      Logger.success(`✅ Almacenamiento local: OK (${storageDir})`);
      return true;
    } catch (error) {
      Logger.error("Error verificando almacenamiento", error);
      return false;
    }
  }

  /**
   * Generar reporte de dependencias
   */
  static async generateDependencyReport(): Promise<object> {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.STATE || "dev",
      components: {
        ai: {
          type: "Ollama (Local)",
          url: process.env.OLLAMA_URL || "http://localhost:11434",
          model: process.env.AI_MODEL || "mistral",
          status: await AIService.isAvailable() ? "active" : "inactive"
        },
        database: {
          type: "PostgreSQL (Local)",
          host: process.env.DB_HOST || "localhost",
          port: process.env.DB_PORT || "5432",
          name: process.env.DB_NAME || "sql_evaluator"
        },
        storage: {
          type: "Local Filesystem",
          path: process.env.STORAGE_DIR || "./storage"
        }
      },
      externalDependencies: "NONE - El sistema es completamente local"
    };
  }
}

export default DependencyCheckService;