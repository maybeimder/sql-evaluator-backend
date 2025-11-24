// app/controllers/r-users.controller.ts
import type { Controller } from "../types/types";

export const getUserList : Controller = (req, res) => {
  res.json({ message: "Listar usuarios" });
};

export const createUser : Controller = (req, res) => {
  res.json({ message: "New User" });
};

export const getUserByID : Controller = (req, res) => {
  res.json({ message: "Get user by ID" });
};

export const editUserRolesByID : Controller = async (req, res) => {
    

};
