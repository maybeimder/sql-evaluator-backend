// app/controllers/r-assignments.controller.ts
import type { Controller } from "../types/types";

export const createAssignment : Controller = (req, res) => {
  res.json({ message: "New Assignment" });
};

export const searchAssignmentById : Controller = (req, res) => {
  res.json({ message: "Get assignments by examID" });
};

export const startAssignment : Controller = (req, res) => {
  res.json({ message: "Start assignment by id" });
};

export const updateRemainingTime : Controller = (req, res) => {
  res.json({ message: "Get remaining time by id" });
};

export const submitQuery : Controller = (req, res) => {
  res.json({ message: "submit sql query" });
};

export const submitAnswer : Controller = (req, res) => {
  res.json({ message: "Submit an answer to a question" });
};

export const finishAssignment : Controller = (req, res) => {
  res.json({ message: "mark status as finished" });
};

export const blockStudent : Controller = (req, res) => {
  res.json({ message: "block an student" });
};

export const getAnswersByExamAndStudent : Controller = (req, res) => {
  res.json({ message: "Get answers by examID and studentID" });
};