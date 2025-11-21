// app/controllers/r-questions.controller.js

export const questions_get = (req, res) => {
  res.json({ message: "Listar preguntas de un examID" });
};

export const questions_post = (req, res) => {
  res.json({ message: "Nueva pregunta para un examID" });
};

export const id = (req, res) => {
  res.json({ message: "Devuelve el detalle de una pregunta específica." });
};
