// app/config/config.ts
import dotenv from "dotenv";

dotenv.config();

const STATE = process.env.STATE || "dev";

export const isProd = STATE === "prod";
export const isDev  = STATE === "dev";
export const isTest = STATE === "test";

type SameSiteType = "lax" | "strict" | "none";

// 🔧 Configuración por ambiente
const environments: Record<string, any> = {
  dev: {
    origins: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ],
    corsOptions: {
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    cookieSecure: false,
    sameSite: "lax" as SameSiteType,
    logLevel: "debug"
  },
  test: {
    origins: ["http://localhost:3000", "http://localhost:5173"],
    corsOptions: {
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    cookieSecure: false,
    sameSite: "lax" as SameSiteType,
    logLevel: "info"
  },
  prod: {
    origins: ["https://byder.dev"],
    corsOptions: {
      credentials: true,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      allowedHeaders: ["Content-Type", "Authorization"]
    },
    cookieSecure: true,
    sameSite: "none" as SameSiteType,
    logLevel: "error"
  }
};

const envConfig = environments[STATE] || environments.dev;

export const ALLOWED_ORIGINS = envConfig.origins;
export const CORS_OPTIONS = envConfig.corsOptions;

// 🔧 Configuración segura para cookies
export const COOKIE_SETTINGS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: SameSiteType;
    path: string;
    maxAge: number;
} = {
    httpOnly: true,
    secure: envConfig.cookieSecure,
    sameSite: envConfig.sameSite,
    path: "/",
    maxAge: 24 * 60 * 60 * 1000
};

// 🔧 Configuración de JWT
export const JWT_CONFIG = {
    secret: process.env.JWT_SECRET || "default_jwt_secret_change_in_production",
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || "default_refresh_secret_change_in_production",
    expiresIn: process.env.TOKEN_EXPIRY || "1h",
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRY || "24h"
};

// 🔧 Configuración de la API
export const API_CONFIG = {
    port: process.env.PORT || 3000,
    environment: STATE,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    logLevel: envConfig.logLevel
};

// 🔧 Configuración de Base de Datos
export const DB_CONFIG = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "sql_evaluator"
};

// 🔧 Configuración de ROBLE
export const ROBLE_CONFIG = {
    baseUrl: process.env.ROBLE_BASE_URL || "https://roble-api.openlab.uninorte.edu.co/database",
    dbName: process.env.ROBLE_DB_NAME || "idd",
    accessToken: process.env.ROBLE_ACCESS_TOKEN || ""
};

// 🔧 Rutas y Gateways por ambiente
export const GATEWAYS = {
  auth: STATE === "prod" ? "https://byder.dev/auth" : "http://localhost:3000/auth",
  api: STATE === "prod" ? "https://byder.dev/api" : "http://localhost:3000",
  database: STATE === "prod" ? "https://byder.dev/database" : "http://localhost:3000/postgres"
};

