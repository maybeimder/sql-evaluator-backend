// app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({ origin: (origin, callback ) => { return callback(null, true) } }));
app.use(express.json());

// Registrar rutas y schemas
app.use("/auth"       , authRoutes        );
app.use("/users"      , usersRoutes       );
app.use("/databases"  , databasesRoutes   );
app.use("/exams"      , requireAuth , examsRoutes       );
app.use("/exams"      , requireAuth , questionsRoutes   );
app.use("/questions"  , requireAuth , questionsRoutes   );
app.use("/assignments", requireAuth , assignmentsRoutes );

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Test Middleware
app.get("/test-auth", requireAuth, (req, res) => {
    res.json({
        ok: true,
        robleUser: req.auth.roble,
        userCache: req.auth.user
    });
});

// Test Middleware
app.get("/test-admin-level", 
  requireAuth, 
  requireRole("ADMIN"),
  (req, res) => {
    res.json({
        ok: true,
        robleUser: req.auth.roble,
        userCache: req.auth.user
    });
});

// Test Middleware
app.get("/test-professor-level", 
  requireAuth, 
  requireRole("PROFESSOR"),
  (req, res) => {
    res.json({
        ok: true,
        robleUser: req.auth.roble,
        userCache: req.auth.user
    });
});

// Test Middleware
app.get("/test-student-level", 
  requireAuth, 
  requireRole("STUDENT"),
  (req, res) => {
    res.json({
        ok: true,
        robleUser: req.auth.roble,
        userCache: req.auth.user
    });
});

// Test Middleware
app.post("/test-login", async (req, res) => {

});



// Levantar el servidor
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // En caso tal no existan las tablas, descomentar 
  // await initTables();
});
