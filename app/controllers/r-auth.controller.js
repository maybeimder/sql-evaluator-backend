// app/controllers/r-auth.controller.js

export const register = (req, res) => {
  res.json({ message: "Register OK" });
};

export const verify = (req, res) => {
  res.json({ message: "Verify OK" });
};

export const login = (req, res) => {
  res.json({ message: "Login OK" });
};

export const logout = (req, res) => {
  res.json({ message: "Logout OK" });
};

export const refreshToken = (req, res) => {
  res.json({ message: "Refresh Token OK" });
};
