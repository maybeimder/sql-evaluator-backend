// app/cache/userCache.ts

export type UserCache = {
    UserID: string;
    RobleID: string;
    FullName: string;
    Email: string;
    Roles: number[];
    Code?: number;
    ExpiresAt: number;
};

// Definir el tiempo de vida del caché
const CACHE_TTL = 5 * 60 * 1000;

// ✅ Exportar el Map como valor (no tipo)
export const userCache = new Map<string, UserCache>();

// Guardar usuario en caché
export function cacheUser(userID: number, userData: any) {
    userCache.set(String(userID), {
        ...userData,
        ExpiresAt: Date.now() + CACHE_TTL,
        cachedAt: Date.now()
    });
}

// Getter 
export function getUserCache(robleID: string): UserCache | null {
    const entry = userCache.get(robleID);

    if (!entry) return null;

    if (entry.ExpiresAt < Date.now()) {
        userCache.delete(robleID);
        return null;
    }

    return entry;
}

// Setter
export function setUserCache(robleID: string, data: Omit<UserCache, "ExpiresAt">) {
    userCache.set(robleID, {
        ...data,
        ExpiresAt: Date.now() + CACHE_TTL
    });
}

// Para los bloqueos
export function invalidateUserCache(robleID: string) {
    userCache.delete(robleID);
}

// Limpiar todo el caché
export function clearUserCache() {
    userCache.clear();
}