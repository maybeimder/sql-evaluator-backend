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
import initTables from "./app/database/initTables.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Registrar rutas y schemas
app.use("/auth" , authRoutes );
app.use("/users", usersRoutes);
app.use("/databases", databasesRoutes );
app.use("/exams", examsRoutes );
app.use("/exams", questionsRoutes );
app.use("/questions", questionsRoutes );
app.use("/assignments", assignmentsRoutes );

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});


// Levantar el servidor
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);

  // En caso tal no existan las tablas, descomentar 
  // await initTables();
});
