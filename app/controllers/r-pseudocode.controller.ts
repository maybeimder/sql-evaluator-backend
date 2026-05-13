// app/controllers/r-pseudocode.controller.ts
import type { Controller } from "../types/types";
import interpreter from "../utils/Interpreter.js";

export const runPseudocode: Controller = (req, res) => {
    const { code, inputs = [] } = req.body;

    if (!code)
        return res.status(400).json({ error: "Falta el código (code)" });

    const result = interpreter.run(code, inputs);

    return res.json({ ok: true, ...result });
};