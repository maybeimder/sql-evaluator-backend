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

// (init)
import initTables from "./app/database/initTables";
import { requireAuth, requireRole } from "./app/middlewares/auth.middleware";
import { robleClient } from "./app/connection/robleClient";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
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
        robleUser: req.robleUser,
        userCache: req.userCache
    });
});

// Test Middleware
app.get("/test-auth2", 
  requireAuth, 
  requireRole("ADMIN"),
  (req, res) => {
    res.json({
        ok: true,
        robleUser: req.robleUser,
        userCache: req.userCache
    });
});

// Test Middleware
app.get("/test-login", async (req, res) => {
    const result = await robleClient("auth").post("/login", {
      email: "aferrerj@uninorte.edu.co",
      password: process.env.MI_CONTRA ,
    }); 

    const { accessToken, refreshToken } = result.data;
    
    if ( !refreshToken || !accessToken ) {
      return res.status(500).json({ error: "NAAA AMFASIMFAISMFA"})
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
        ok: true,
        accessToken: accessToken,
        message: "WAAAA" 
    })
});



// Levantar el servidor
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // En caso tal no existan las tablas, descomentar 
  // await initTables();
});
