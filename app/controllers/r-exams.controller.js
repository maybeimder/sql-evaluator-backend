// app/controllers/r-exams.controller.js

export const exams_get = (req, res) => {
  res.json({ message: "Listar exams" });
};

export const exams_post = (req, res) => {
  res.json({ message: "New exam" });
};

export const id = (req, res) => {
  res.json({ message: "Get exam info by ID" });
};

export const status = (req, res) => {
  res.json({ message: "Get exam status by ID" });
};
