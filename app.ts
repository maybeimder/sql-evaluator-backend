// app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

// Rutas
import authRoutes from "./app/routes/r-auth.routes"
import usersRoutes from "./app/routes/r-users.routes"
import databasesRoutes from "./app/routes/r-databases.routes"
import examsRoutes from "./app/routes/r-exams.routes"
import assignmentsRoutes from "./app/routes/r-assignments.routes"
import questionsRoutes from "./app/routes/r-questions.routes" 

// Middlewares
import { requireAuth } from "./app/middlewares/auth.middleware";
import { requireRole } from "./app/middlewares/roles.middleware"

// (init)
import initTables from "./app/database/initTables";
import { robleClient } from "./app/connection/robleClient";
import { errorHandler } from "./app/middlewares/errorHandler";
import { ALLOWED_ORIGINS } from "./app/config/config";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ 
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(cookieParser());

// Registrar rutas y schemas
app.use("/auth"       , authRoutes        );
app.use("/databases"  , requireAuth , databasesRoutes   );
app.use("/users"      , requireAuth , usersRoutes       );
app.use("/exams"      , requireAuth , examsRoutes       );
app.use("/exams"      , requireAuth , questionsRoutes   );
app.use("/questions"  , requireAuth , questionsRoutes   );
app.use("/assignments", requireAuth , assignmentsRoutes );
app.use( errorHandler );

// Levantar el servidor
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // En caso tal no existan las tablas, descomentar 
  // await initTables();
});
