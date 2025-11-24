// app/controllers/r-exams.controller.ts
import { listAllExams, listProfessorExams, listStudentExams, newExam } from "../models/Exams.model";
import type { Controller } from "../types/types"

export const createExam : Controller = async (req, res) => {
    const token = req.auth.token;
    const professor = req.auth.user;

    if ( ! token )
        return res.status(400).json({ error: "No se pudo validar el token" });

    if ( ! professor?.Roles.includes(2) && ! professor?.Roles.includes(1) )
        return res.status(403).json({ error: "No tiene permisos para crear examenes" });

    const { ProfessorID, DatabaseID, Title, Description, StartTime, EndTime, AllowsRejoin, CreatedAt } = req.body;

    if ( ! ProfessorID || ! Title )
        return res.status(400).json({ error: "Faltan campos" });

    const robleResponse = await newExam( token, ProfessorID, Title )

    if (!robleResponse)
        return res.status(500).json({ error: "Error Inesperado creando el examen" });

    return res.status(200).json({ ok:true, exam:robleResponse });
};


export const getExamsList: Controller = async (req, res) => {
    const token = req.auth.token;
    const user  = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    // Si es ADMIN
    if (user?.Roles.includes(1)) {
        const list = await listAllExams(token, user.UserID);
        return res.status(200).json(list);
    }

    // Si es Profesor
    else if (user?.Roles.includes(2)) {
        const list = await listProfessorExams(token, user.UserID);
        return res.status(200).json(list);
    }

    // Si es estudiante
    else if (user?.Roles.includes(3)) {
        const list = await listStudentExams(token, user.UserID);
        return res.status(200).json(list);
    }

    return res.status(403).json({ error: "Rol no reconocido" });
};


export const getExamInfoByID : Controller = (req, res) => {
  res.json({ message: "Get exam info by ID" });
};

export const getExamStatusByID : Controller = (req, res) => {
  res.json({ message: "Get exam status by ID" });
};


