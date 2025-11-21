// app/controllers/r-assignments.controller.js


export const assignments = (req, res) => {
  res.json({ message: "New Assignment" });
};

export const id = (req, res) => {
  res.json({ message: "Get assignments by examID" });
};

export const start = (req, res) => {
  res.json({ message: "Start assignment by id" });
};

export const uptime = (req, res) => {
  res.json({ message: "Get remaining time by id" });
};

export const sql = (req, res) => {
  res.json({ message: "submit sql query" });
};

export const submit = (req, res) => {
  res.json({ message: "Submit an answer to a question" });
};

export const finish = (req, res) => {
  res.json({ message: "mark status as finished" });
};

export const block = (req, res) => {
  res.json({ message: "block an student" });
};

export const answers = (req, res) => {
  res.json({ message: "Get answers by examID and studentID" });
};

export const roles = (req, res) => {
  res.json({ message: "Edit userRoles OK" });
};
