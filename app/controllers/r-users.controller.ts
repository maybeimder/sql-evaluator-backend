// app/controllers/r-users.controller.ts
import type { Controller } from "../types/types";
import { robleClient } from "../connection/robleClient";
import { getUsersListByRole, getUserByID as getUserByIDModel } from "../models/Users.model";
import { getQuestionsByExam } from "../models/Questions.model";
import { getExamByID } from "../models/Exams.model";
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
    const allAttempts: any[] = attemptsRes.data ?? [];

    const attemptsByAssignment = new Map<string, any[]>();
    for (const attempt of allAttempts) {
        if (!attemptsByAssignment.has(attempt.AssignmentID))
            attemptsByAssignment.set(attempt.AssignmentID, []);
        attemptsByAssignment.get(attempt.AssignmentID)!.push(attempt);
    }

    const enriched = users.map(user => {
        const assignments = allAssignments.filter(a => a.StudentID === user.UserID);

        let totalScore = 0;
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
            enrollmentDate: new Date(user.CreatedAt).toLocaleDateString("es-CO"),
            examsTaken: assignments.length,
            averageScore: totalCounts > 0 ? Math.round(totalScore / totalCounts) : 0,
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
    let totalScore = 0;
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
            id: user.UserID,
            name: user.FullName,
            email: user.Email,
            enrollmentDate: new Date(user.CreatedAt).toLocaleDateString("es-CO"),
            examsTaken: assignments.length,
            averageScore,
        }
    });
};

export const getStudentAverage: Controller = async (req, res) => {
    const token = req.auth.token;
    const student = req.auth.user;
    const studentID = student?.UserID;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    // 1. Assignments del estudiante
    const assignmentsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: studentID }
    });
    const assignments: any[] = assignmentsRes.data ?? [];

    if (assignments.length === 0)
        return res.json({ ok: true, average: 0, exams: [] });

    // 2. Por cada assignment, sacar mejor score y total de puntos del examen
    const examResults = await Promise.all(
        assignments.map(async (assignment) => {

            // Mejor intento
            const attemptsRes = await robleClient().get("/read", {
                headers: { Authorization: `Bearer ${token}` },
                params: { tableName: "AssignmentAttempts", AssignmentID: assignment.AssignmentID }
            });
            const attempts: any[] = attemptsRes.data ?? [];
            const bestScore = attempts.length > 0
                ? Math.max(...attempts.map((a: any) => a.Score))
                : 0;

            // Total de puntos del examen (suma de Value de preguntas)
            const questions = await getQuestionsByExam(token, assignment.ExamID);
            const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.Value ?? 0), 0);

            if (totalPoints === 0) return null;

            console.log(`[average] examID: ${assignment.ExamID} | bestScore: ${bestScore} | totalPoints: ${totalPoints}`);

            return {
                examID: assignment.ExamID,
                bestScore,
                totalPoints,
                percentage: Math.min(100, Math.round((bestScore / totalPoints) * 100)),
            };
        })
    );

    // 3. Filtrar nulls (exámenes sin preguntas) y calcular promedio
    const valid = examResults.filter(Boolean) as any[];

    const average = valid.length > 0
        ? Math.round(valid.reduce((sum, e) => sum + e.percentage, 0) / valid.length)
        : 0;

    return res.json({
        ok: true,
        average,
        exams: valid,
    });
};

export const getStudentExamHistory: Controller = async (req, res) => {
    const token     = req.auth.token;
    const requester = req.auth.user;
    const { studentID } = req.params;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    // Solo el propio estudiante, profesores o admins
    if (
        requester?.UserID !== studentID &&
        !requester?.Roles?.includes(1) &&
        !requester?.Roles?.includes(2)
    )
        return res.status(403).json({ error: "Sin permisos para ver este historial" });

    // 1. Assignments del estudiante
    const assignmentsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: studentID }
    });
    const assignments: any[] = assignmentsRes.data ?? [];

    if (assignments.length === 0)
        return res.json({ ok: true, history: [] });

    // 2. Por cada assignment cruzar con examen y mejor intento
    const history = await Promise.all(
        assignments.map(async (assignment) => {

            const [exam, attemptsRes, questions] = await Promise.all([
                getExamByID(token, assignment.ExamID),
                robleClient().get("/read", {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { tableName: "AssignmentAttempts", AssignmentID: assignment.AssignmentID }
                }),
                getQuestionsByExam(token, assignment.ExamID),
            ]);

            const attempts: any[]  = attemptsRes.data ?? [];
            const bestScore        = attempts.length > 0
                ? Math.max(...attempts.map((a: any) => a.Score))
                : null;
            const lastAttempt      = attempts.sort((a, b) =>
                new Date(b.SubmittedAt).getTime() - new Date(a.SubmittedAt).getTime()
            )[0] ?? null;

            const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.Value ?? 0), 0);
            const percentage  = (bestScore !== null && totalPoints > 0)
                ? Math.min(100, Math.round((bestScore / totalPoints) * 100))
                : null;

            const PASS_THRESHOLD = 60;
            const status = percentage === null
                ? "Pendiente"
                : percentage >= PASS_THRESHOLD ? "Aprobado" : "Reprobado";

            return {
                examID   : assignment.ExamID,
                exam     : exam?.Title ?? "Examen desconocido",
                score    : percentage,
                date     : lastAttempt
                    ? new Date(lastAttempt.SubmittedAt).toLocaleDateString("es-CO")
                    : null,
                status,
            };
        })
    );

    // Ordenar por fecha descendente
    const sorted = history.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return res.json({ ok: true, count: sorted.length, history: sorted });
};