// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import initTables from "./app/database/initTables.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API running");
});

// Levantar el servidor
app.listen(PORT, async () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);

  // await initTables();
});
