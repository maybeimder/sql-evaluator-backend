// app/services/storage.service.ts

import { userCache, cacheUser, getUserCache, setUserCache, invalidateUserCache, clearUserCache, UserCache } from "../cache/userCache";
import { savePendingCode, getPendingCode, deletePendingCode } from "../cache/pendingCache";

/**
 * Servicio de almacenamiento en caché y configuración
 * Proporciona acceso centralizado a datos en memoria
 */

export class StorageService {
  // ========== USER CACHE ==========

  static cacheUser(userID: number, userData: any) {
    cacheUser(userID, userData);
  }

  static getUser(robleID: string): UserCache | null {
    return getUserCache(robleID);
  }

   static deleteUser(robleID: string) {
    invalidateUserCache(robleID);
  }

   static clearUserCache() {
    clearUserCache();
  }

  // ========== PENDING CODES (Email Verification) ==========

  static savePendingCode(email: string, code: number, role?: number | null) {
    savePendingCode(email, code, role);
  }

  static getPendingCode(email: string) {
    return getPendingCode(email);
  }

  static deletePendingCode(email: string) {
    deletePendingCode(email);
  }

  // ========== SESSION STORAGE ==========

  static getActiveSessions(): number {
    return userCache.size;
  }

  static getAllCachedUsers() {
    return Array.from(userCache.entries()).map(([robleID, data]) => ({
      robleID,
      ...data
    }));
  }

  // ========== CONFIG ACCESS ==========

  static getConfig() {
    return {
      environment: process.env.STATE || 'dev',
      apiUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
      dbName: process.env.DB_NAME || 'sql_evaluator'
    };
  }
}

export default StorageService;