// app/models/Exams.model.ts
import { robleClient } from "../connection/robleClient";

export type ExamRegister = {
    ExamID: string,
    ProfessorID: string,
    Title: string,
    DatabaseID: string | null,
    Description: string | null,
    StartTime: string | null,
    EndTime: string | null,
    AllowsRejoin: boolean,
    CreatedAt: string,
};

import type { AssignmentRegister } from "./Assignments.model";

// Crear un examen en ROBLE
export async function newExam(
    token: string,
    professorID: string,
    title: string,
    databaseID: string | null = null,
    description: string | null = null,
    startTime: string | null = null,
    endTime: string | null = null,
    allowRejoin: boolean = false
): Promise<ExamRegister | null> {

    const newExamID = crypto.randomUUID();
    const now = new Date().toISOString();

    // ✔ CORRECTO: enviar payload dentro de params
    const res = await robleClient().post("/insert", {
        tableName: "Exams",
        records: [
            {
                ExamID: newExamID,
                ProfessorID: professorID,
                DatabaseID: databaseID,
                Title: title,
                Description: description,
                StartTime: startTime,
                EndTime: endTime,
                AllowsRejoin: allowRejoin,
                CreatedAt: now,
            }
        ]
    }, {
        headers: { Authorization: "Bearer " + token }
    });

    return {
        ExamID: newExamID,
        ProfessorID: professorID,
        DatabaseID: databaseID,
        Title: title,
        Description: description,
        StartTime: startTime,
        EndTime: endTime,
        AllowsRejoin: allowRejoin,
        CreatedAt: now,
    }
}

export async function listProfessorExams(token: string, professorID: string): Promise<ExamRegister[]> {
    const res = await robleClient().get<Array<ExamRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams", ProfessorID: professorID }
    });

    return res.data ?? null;
}

export async function listStudentExams(token: string, studentID: string) {
    const assignRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: studentID }
    });

    const assignments: AssignmentRegister[] = assignRes.data ?? [];
    if (assignments.length === 0) return [];

    const examIDs = assignments.map(a => a.ExamID);

    const examsRes = await robleClient().get<Array<ExamRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams" }
    });

    const allExams = examsRes.data ?? [];
    const exams = allExams.filter(exam => examIDs.includes(exam.ExamID));

    const result = exams.map(exam => {
        const relatedAssignments = assignments.filter(a => a.ExamID === exam.ExamID);
        const completed = relatedAssignments.filter(a => a.IsActive === false).length;
        const pending = relatedAssignments.filter(
            a => a.IsActive === true && a.IsBlocked === false
        ).length;

        return {
            ...exam,
            completed,
            pending
        };
    });

    return result;
}

export async function listAllExams(token: string, adminID: string): Promise<ExamRegister[]> {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams" }
    });

    return res.data ?? [];
}

export async function getExamByID(
    token: string,
    examID: string
) {
    // 1. Obtener examen
    const examRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams", ExamID: examID }
    });

    const exam = examRes.data?.[0] ?? null;
    if (!exam) return null;

    // 2. Obtener assignments asociados
    const assignmentsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", ExamID: examID }
    });

    const assignments = assignmentsRes.data ?? [];

    const AssignedCount = assignments.length;
    const AnsweredCount = assignments.filter((a:AssignmentRegister) => a.IsActive === false).length;

    // 3. Obtener datos de estudiantes (Users table)
    const studentIDs = [...new Set(assignments.map((a:AssignmentRegister) => a.StudentID))];

    const studentData = await Promise.all(
        studentIDs.map(async (id) => {
            const res = await robleClient().get("/read", {
                headers: { Authorization: `Bearer ${token}` },
                params: { tableName: "Users", UserID: id }
            });

            const user = res.data?.[0] ?? null;

            return {
                id,
                name: user?.FullName || "—",
                email: user?.Email || "—",
            };
        })
    );

    // 4. Enlazar assignments con los datos del usuario
    const Students = assignments.map((assignment:AssignmentRegister) => {
        const user = studentData.find(u => u.id === assignment.StudentID);

        return {
            id: assignment.StudentID,
            name: user?.name || "—",
            email: user?.email || "—",
            status: assignment.IsActive === false ? "Completado" : "Pendiente",
            score: null, // LATER
        };
    });

    return {
        ExamID: exam.ExamID,
        DatabaseID: exam.DatabaseID,
        Title: exam.Title,
        Description: exam.Description ?? null,
        StartTime: exam.StartTime,
        EndTime: exam.EndTime,
        AssignedCount,
        AnsweredCount,
        AvgScore: null, // pendiente
        Students,
    };
}



