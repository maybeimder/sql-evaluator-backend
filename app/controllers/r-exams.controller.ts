// app/controllers/r-exams.controller.ts
import type { Controller } from "../types/types"

export const getExamsList : Controller = (req, res) => {
  res.json({ message: "Listar exams" });
};

export const getExamInfoByID : Controller = (req, res) => {
  res.json({ message: "Get exam info by ID" });
};

export const getExamStatusByID : Controller = (req, res) => {
  res.json({ message: "Get exam status by ID" });
};

export const createExam : Controller = (req, res) => {
  res.json({ message: "New exam" });
};
