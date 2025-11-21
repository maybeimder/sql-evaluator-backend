// app/controllers/r-databases.controller.ts
import type { Controller } from "../types/types"

export const getDatabasesList : Controller = (req, res) => {
  res.json({ message: "Listar databases" });
};

export const createDatabase : Controller  = (req, res) => {
  res.json({ message: "New DB" });
};

export const getDatabaseByID : Controller = (req, res) => {
  res.json({ message: "Get database info by ID" });
};
