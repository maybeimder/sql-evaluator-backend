// app/controllers/r-users.controller.js

export const users_get = (req, res) => {
  res.json({ message: "Listar usuarios" });
};

export const user_post = (req, res) => {
  res.json({ message: "New User" });
};

export const id = (req, res) => {
  res.json({ message: "Get user by ID" });
};

export const roles = (req, res) => {
  res.json({ message: "Edit userRoles OK" });
};
