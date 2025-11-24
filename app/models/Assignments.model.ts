// app/models/Assignments.model.ts
import crypto from "crypto";
import { robleClient } from "../connection/robleClient";

export type AssignmentRegister = {
    AssignmentID : string,
    StudentID : string, 
    ExamID : string,
    SessionToken : string | null,
    StartedAt: string,
    LastUpdatedAt: string,
    IsActive: boolean,
    IsBlocked: boolean,
};


// Crear un assignment
export async function newAssignment(token: string, examID: string, studentID: string) {

    const AssignmentID = crypto.randomUUID();
    const now = new Date().toISOString();

    await robleClient().post("/insert", {
            tableName: "Assignments",
            records: [{
                AssignmentID,
                StudentID: studentID,
                ExamID: examID,
                SessionToken: null,
                StartedAt: now,
                LastUpdatedAt: now,
                IsActive: false,
                IsBlocked: false,
            }]
        },
        {
            headers: { Authorization: "Bearer " + token }
        }
    );

    return AssignmentID;
}


// Bloquear un assignment
export async function blockAssignment(token: string, assignmentID: string) {

    await robleClient().post("/update", {
            tableName: "Assignments",
            idColumn: "AssignmentID",
            idValue: assignmentID,
            updates: { IsBlocked: true }
        },
        {
            headers: { Authorization: "Bearer " + token }
        }
    );

    return true;
}


// Obtener assignment por ID
export async function getAssignmentByID(token: string, assignmentID: string) {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", AssignmentID: assignmentID }
    });

    return res.data?.[0] ?? null;
}
