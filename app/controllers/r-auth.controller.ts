// app/controllers/r-auth.controller.ts
import type { Controller } from "../types/types";

export const registerUser : Controller = (req, res) => {
  res.json({ message: "Register OK" });
};

export const verifyEmail : Controller = (req, res) => {
  res.json({ message: "Verify OK" });
};

export const loginUser : Controller = (req, res) => {
  res.json({ message: "Login OK" });
};

export const logoutUser : Controller = (req, res) => {
  res.json({ message: "Logout OK" });
};

export const refreshToken : Controller = (req, res) => {
  res.json({ message: "Refresh Token OK" });
};
