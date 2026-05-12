// app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Logger from "./app/utils/logger";

// Rutas
import authRoutes from "./app/routes/r-auth.routes"
import usersRoutes from "./app/routes/r-users.routes"
import databasesRoutes from "./app/routes/r-databases.routes"
import examsRoutes from "./app/routes/r-exams.routes"
import assignmentsRoutes from "./app/routes/r-assignments.routes"
import questionsRoutes from "./app/routes/r-questions.routes" 
import postgresRoutes from "./app/routes/p-databases.routes"

// Middlewares
import { requireAuth } from "./app/middlewares/auth.middleware";
import { requireRole } from "./app/middlewares/roles.middleware"

// Configuración y conexión
import { errorHandler } from "./app/middlewares/errorHandler";
import { ALLOWED_ORIGINS, API_CONFIG, CORS_OPTIONS } from "./app/config/config";
import { pgTest } from "./app/connection/postgres.connection";
import { runMigrations } from "./app/database/migration";

dotenv.config();

const app = express();
const PORT = API_CONFIG.port;

// ========== MIDDLEWARES ==========

// CORS
app.use(cors({ 
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Logger personalizado para cada petición
app.use((req, res, next) => {
    Logger.debug(`${req.method} ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== HEALTH CHECK ==========

app.get("/health", (req, res) => {
    res.json({ 
        status: "OK", 
        timestamp: new Date().toISOString(),
        environment: API_CONFIG.environment
    });
});

// ========== DIAGNÓSTICO API ==========

app.get("/api/info", (req, res) => {
    res.json({
        status: "OK",
        backend: {
            port: PORT,
            environment: API_CONFIG.environment,
            allowedOrigins: ALLOWED_ORIGINS
        },
        frontend: {
            expectedUrl: process.env.FRONTEND_URL || "http://localhost:5173"
        },
        database: {
            connected: true,
            name: process.env.DB_NAME
        },
        timestamp: new Date().toISOString()
    });
});

// ========== RUTAS ==========

app.use("/auth"       , authRoutes        );
app.use("/databases"  , requireAuth , databasesRoutes   );
app.use("/postgres"   , requireAuth , requireRole("PROFESSOR") , postgresRoutes    );
app.use("/users"      , requireAuth , usersRoutes       );
app.use("/exams"      , requireAuth , examsRoutes       );
app.use("/exams"      , requireAuth , questionsRoutes   );
app.use("/questions"  , requireAuth , questionsRoutes   );
app.use("/assignments", requireAuth , assignmentsRoutes );

// ========== ERROR HANDLER ==========

app.use(errorHandler);

// ========== INICIAR SERVIDOR ==========

app.listen(PORT, async () => {
  Logger.success(`🚀 Server running at http://localhost:${PORT}`);
  Logger.info(`📍 Environment: ${API_CONFIG.environment}`);
  Logger.info(`🔒 Allowed Origins: ${ALLOWED_ORIGINS.join(", ")}`);

  // Verificar conexión a base de datos
  try {
    const dbTest = await pgTest();
    Logger.success(`✅ Database connection established`, dbTest);
    
    // Ejecutar migraciones al iniciar
    await runMigrations();
  } catch (error) {
    Logger.error("❌ Database connection failed", error);
    Logger.warn("Make sure PostgreSQL is running and .env variables are correct");
  }
});