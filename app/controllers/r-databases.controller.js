// app/controllers/r-databases.controller.js

export const databases_get = (req, res) => {
  res.json({ message: "Listar databases" });
};

export const databases_post = (req, res) => {
  res.json({ message: "New DB" });
};

export const id = (req, res) => {
  res.json({ message: "Get database info by ID" });
};
