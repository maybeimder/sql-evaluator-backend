// app/config/config.ts

const STATE = process.env.STATE || "dev";

export const isProd = STATE === "prod";
export const isDev  = STATE === "dev";

type SameSiteType = "lax" | "strict" | "none";

// 🔧 Hostnames permitidos según entorno
export const ALLOWED_ORIGINS = isProd
  ? ["https://byder.dev"]
  : [
      "http://localhost:3001", 
      "http://127.0.0.1:3001", 
      "http://localhost:5173", 
      "http://127.0.0.1:5173",
      // Red local — acepta cualquier IP en 192.168.x.x
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    ];
    
// 🔧 Configuración segura para cookies
export const COOKIE_SETTINGS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: SameSiteType;
    path: string;
    maxAge: number;
} = {
    httpOnly: true,
    secure: process.env.STATE !== "dev",      
    sameSite: process.env.STATE === "dev" 
        ? "lax" 
        : "none",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
};

