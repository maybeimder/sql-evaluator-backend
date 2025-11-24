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

export async function listStudentExams(token: string, studentID: string): Promise<ExamRegister[]> {
    const assignRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: studentID }
    });

    if (!assignRes.data || assignRes.data.length === 0)
        return [];

    const examIDs = assignRes.data.map((a: AssignmentRegister) => a.ExamID);

    const examsRes = await robleClient().get<Array<ExamRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams", ExamID: examIDs }
    });

    return examsRes.data ?? [];
}

export async function listAllExams(token: string, adminID: string): Promise<ExamRegister[]> {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams" }
    });

    return res.data ?? [];
}

export async function getExamByTitle(token: string, professorID: string, title: string) {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Exams", ProfessorID: professorID, Title: title }
    });

    return res.data?.[0] ?? null;
}


