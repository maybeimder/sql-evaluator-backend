// app/controllers/r-attempts.controller.ts
import type { Controller } from "../types/types";
import { getAttemptsByAssignment, getBestScore } from "../models/AssignmentAttemps.model"

// 🟩 [ GET ] /attempts/assignment/:assignmentID
// Todos los intentos de un assignment con su puntaje
export const getAttemptsByAssignmentID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;
    const { assignmentID } = req.params;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2) && user?.UserID !== assignmentID)
        return res.status(403).json({ error: "Sin permisos para ver estos intentos" });

    const attempts = await getAttemptsByAssignment(token, assignmentID);

    return res.json({
        ok      : true,
        count   : attempts.length,
        attempts,
    });
};

// 🟩 [ GET ] /attempts/assignment/:assignmentID/score
// Mejor puntaje + historial de intentos
export const getScoreByAssignmentID: Controller = async (req, res) => {
    const token = req.auth.token!;
    const user  = req.auth.user;
    const { assignmentID } = req.params;

    if (!user?.Roles?.includes(1) && !user?.Roles?.includes(2) && user?.UserID !== assignmentID)
        return res.status(403).json({ error: "Sin permisos para ver el puntaje" });

    const [attempts, bestScore] = await Promise.all([
        getAttemptsByAssignment(token, assignmentID),
        getBestScore(token, assignmentID),
    ]);

    return res.json({
        ok         : true,
        bestScore,
        totalTries : attempts.length,
        attempts,
    });
};