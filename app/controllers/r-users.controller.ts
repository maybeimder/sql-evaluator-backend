// app/controllers/r-users.controller.ts
import type { Controller } from "../types/types";
import { robleClient } from "../connection/robleClient";
import { getUsersListByRole, getUserByID as getUserByIDModel } from "../models/Users.model";
export const getUserList: Controller = (req, res) => {
    res.json({ message: "Listar usuarios" });
};

export const createUser: Controller = (req, res) => {
    res.json({ message: "New User" });
};

export const editUserRolesByID: Controller = async (req, res) => {
};

export const getUserListWithRole: Controller = async (req, res) => {
    const token = req.auth.token;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { roleID } = req.params;

    const numericRole = Number(roleID);
    if (Number.isNaN(numericRole))
        return res.status(400).json({ ok: false, message: "roleID debe ser un número" });

    if (![1, 2, 3].includes(numericRole))
        return res.status(400).json({ ok: false, message: "roleID inválido" });

    const users = await getUsersListByRole(token, numericRole);

    if (users.length === 0)
        return res.json({ ok: true, roleID: numericRole, count: 0, users: [] });

    const [assignmentsRes, attemptsRes] = await Promise.all([
        robleClient().get("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: { tableName: "Assignments" }
        }),
        robleClient().get("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: { tableName: "AssignmentAttempts" }
        }),
    ]);

    const allAssignments: any[] = assignmentsRes.data ?? [];
    const allAttempts: any[]    = attemptsRes.data    ?? [];

    const attemptsByAssignment = new Map<string, any[]>();
    for (const attempt of allAttempts) {
        if (!attemptsByAssignment.has(attempt.AssignmentID))
            attemptsByAssignment.set(attempt.AssignmentID, []);
        attemptsByAssignment.get(attempt.AssignmentID)!.push(attempt);
    }

    const enriched = users.map(user => {
        const assignments = allAssignments.filter(a => a.StudentID === user.UserID);

        let totalScore  = 0;
        let totalCounts = 0;

        for (const assignment of assignments) {
            const attempts = attemptsByAssignment.get(assignment.AssignmentID) ?? [];
            if (attempts.length > 0) {
                const best = Math.max(...attempts.map((a: any) => a.Score));
                totalScore += best;
                totalCounts++;
            }
        }

        return {
            ...user,                                                              // ← todos los campos de UserRegister
            enrollmentDate : new Date(user.CreatedAt).toLocaleDateString("es-CO"),
            examsTaken     : assignments.length,
            averageScore   : totalCounts > 0 ? Math.round(totalScore / totalCounts) : 0,
        };
    });

    return res.json({
        ok: true,
        roleID: numericRole,
        count: enriched.length,
        users: enriched,
    });
};

export const getUserByID: Controller = async (req, res) => {
    const token = req.auth.token;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { userID } = req.params;

    // 1. Datos del usuario
    const user = await getUserByIDModel(token, userID);

    if (!user)
        return res.status(404).json({ error: "Usuario no encontrado" });

    // 2. Assignments del estudiante
    const assignmentsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: userID }
    });
    const assignments: any[] = assignmentsRes.data ?? [];

    // 3. Puntaje promedio — sacar todos los intentos de cada assignment
    let totalScore  = 0;
    let totalCounts = 0;

    for (const assignment of assignments) {
        const attemptsRes = await robleClient().get("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: { tableName: "AssignmentAttempts", AssignmentID: assignment.AssignmentID }
        });
        const attempts: any[] = attemptsRes.data ?? [];

        if (attempts.length > 0) {
            const best = Math.max(...attempts.map((a: any) => a.Score));
            totalScore += best;
            totalCounts++;
        }
    }

    const averageScore = totalCounts > 0
        ? Math.round(totalScore / totalCounts)
        : 0;

    return res.json({
        ok: true,
        student: {
            id             : user.UserID,
            name           : user.FullName,
            email          : user.Email,
            enrollmentDate : new Date(user.CreatedAt).toLocaleDateString("es-CO"),
            examsTaken     : assignments.length,
            averageScore,
        }
    });
};