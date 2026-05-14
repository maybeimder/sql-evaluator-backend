// app/controllers/r-exams.controller.ts
import { getExamByID, listAllExams, listProfessorExams, listStudentExams, newExam } from "../models/Exams.model";
import { getQuestionsByExam } from "../models/Questions.model";
import { addMinutes } from "../utils/exams.helper";
import type { Controller } from "../types/types"
import { NewQuestionInput, newQuestions } from "../models/Questions.model";
import { robleClient } from "../connection/robleClient";

export const createExam: Controller = async (req, res) => {
    const token = req.auth.token;
    const professor = req.auth.user;
    const questions = req.body.questions ?? [];

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles.includes(2) && !professor?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para crear examenes" });

    const {
        Title,
        Description,
        StartTime,
        Duration,
        DatabaseID,
        AllowsRejoin,
        Type
    } = req.body;

    if (!StartTime || !Title || !Duration)
        return res.status(400).json({ error: "Faltan campos" });

    const EndTime = addMinutes(StartTime, Duration);

    const newExamRecord = await newExam(
        token,
        professor.UserID,
        Title,
        DatabaseID ?? null,
        Description ?? null,
        StartTime,
        EndTime,
        AllowsRejoin ?? false,
        Type
    );

    if (!newExamRecord)
        return res.status(500).json({ error: "Error Inesperado creando el examen" });
    
    if (!Array.isArray(questions) || questions.length === 0)
        return res.status(200).json({ ok: true, exam: newExamRecord, questions: [] });

    const cachedQuestions = await newQuestions(token, questions.map((p: NewQuestionInput) => ({
        ExamID: newExamRecord.ExamID,
        QuestionTitle: p.QuestionTitle,
        QuestionText: p.QuestionText,
        ExpectedOutput: p.Inputs ? { inputs:p.Inputs, outputs: p.ExpectedOutput } : p.ExpectedOutput,
        SolutionExample: p.SolutionExample,
        Value: p.Value
    })));

    return res.status(200).json({ ok: true, exam: newExamRecord, questions: cachedQuestions });
};

export const getExamsList: Controller = async (req, res) => {
    const token = req.auth.token;
    const user = req.auth.user;

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

export const getExamInfoByID: Controller = async (req, res) => {
    const token = req.auth.token;
    const professor = req.auth.user
    const { examID } = req.params;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles.includes(2) && !professor?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para crear examenes" });

    if (!examID) {
        return res.status(400).json({
            error: "Falta examID en la URL"
        });
    }

    const examInfo = await getExamByID(token, examID);
    if (!examInfo) {
        return res.status(404).json({
            error: "Examen no encontrado"
        });
    }

    return res.json({
        ok: true,
        exam: examInfo
    });
};

export const getExamStatusByID: Controller = (req, res) => {
    res.json({ message: "Get exam status by ID" });
};

export const updateExamByID: Controller = async (req, res) => {
    const token     = req.auth.token;
    const professor = req.auth.user;
    const { examID } = req.params;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles.includes(2) && !professor?.Roles.includes(1))
        return res.status(403).json({ error: "No tiene permisos para editar exámenes" });

    if (!examID)
        return res.status(400).json({ error: "Falta examID en la URL" });

    const {
        Title,
        Description,
        StartTime,
        Duration,
        DatabaseID,
        AllowsRejoin,
    } = req.body;

    // Construir solo los campos que llegaron
    const updates: Record<string, any> = {};
    if (Title        !== undefined) updates.Title        = Title;
    if (Description  !== undefined) updates.Description  = Description;
    if (StartTime    !== undefined) updates.StartTime    = StartTime;
    if (DatabaseID   !== undefined) updates.DatabaseID   = DatabaseID;
    if (AllowsRejoin !== undefined) updates.AllowsRejoin = AllowsRejoin;

    // Duration requiere recalcular EndTime
    if (Duration !== undefined && StartTime !== undefined)
        updates.EndTime = addMinutes(StartTime, Duration);
    else if (Duration !== undefined) {
        const exam = await getExamByID(token, examID);
        if (!exam) return res.status(404).json({ error: "Examen no encontrado" });
        updates.EndTime = addMinutes(exam.StartTime, Duration);
    }

    if (Object.keys(updates).length === 0)
        return res.status(400).json({ error: "No se enviaron campos para actualizar" });

    await robleClient().put(
        "/update",
        {
            tableName : "Exams",
            idColumn  : "ExamID",
            idValue   : examID,
            updates,
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json({ ok: true, examID, updates });
};

export const getExamResultsByStudent: Controller = async (req, res) => {
    const token   = req.auth.token;
    const student = req.auth.user;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { examID } = req.params;
    const studentID  = student?.UserID;

    // 1. Examen
    const exam = await getExamByID(token, examID);
    if (!exam)
        return res.status(404).json({ error: "Examen no encontrado" });

    // 2. Assignment del estudiante para este examen
    const assignmentsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Assignments", StudentID: studentID, ExamID: examID }
    });
    const assignment = assignmentsRes.data?.[0] ?? null;

    if (!assignment)
        return res.status(404).json({ error: "No tienes un assignment para este examen" });

    // 3. Preguntas del examen
    const questions = await getQuestionsByExam(token, examID);

    // 4. Respuestas del estudiante
    const answersRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "StudentAssignmentAnswers", AssignmentID: assignment.AssignmentID }
    });
    const answers: any[] = answersRes.data ?? [];

    // 5. Mejor intento
    const attemptsRes = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "AssignmentAttempts", AssignmentID: assignment.AssignmentID }
    });
    const attempts: any[] = attemptsRes.data ?? [];
    const bestScore = attempts.length > 0
        ? Math.max(...attempts.map((a: any) => a.Score))
        : null;

    // 6. Indexar respuestas por QuestionID
    const answersByQuestion = new Map<string, any>();
    for (const answer of answers)
        answersByQuestion.set(answer.QuestionID, answer);

    // 7. Cruzar preguntas con respuestas
    const questionsWithAnswers = questions.map(q => {
        const answer = answersByQuestion.get(q.QuestionID) ?? null;

        return {
            id              : q.QuestionID,
            questionTitle   : q.QuestionTitle,
            questionText    : q.QuestionText,
            solutionExample : q.SolutionExample,
            expectedOutput  : q.ExpectedOutput ?? null,
            studentQuery    : answer?.Answer        ?? null,
            studentOutput   : answer?.AnswerOutput  ?? null,
            maxScore        : q.Value,
            awardedScore    : (answer?.IsCorrect && q.Value) ? q.Value : 0,
            isCorrect       : answer?.IsCorrect ?? null,
        };
    });

    return res.json({
        ok     : true,
        result : {
            id         : examID,
            title      : exam.Title,
            date       : exam.StartTime,
            score      : bestScore,
            questions  : questionsWithAnswers,
        }
    });
};

export const deleteExamByID: Controller = async (req, res) => {
    const token     = req.auth.token;
    const professor = req.auth.user;
    const { examID } = req.params;

    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    if (!professor?.Roles?.includes(1) && !professor?.Roles?.includes(2))
        return res.status(403).json({ error: "No tiene permisos para eliminar exámenes" });

    // 1. Verificar que el examen existe
    const exam = await getExamByID(token, examID);
    if (!exam)
        return res.status(404).json({ ok: false, error: "Examen no encontrado" });

    // 2. Eliminar el examen en Roble
    await robleClient().delete(`/delete`, {
        headers: { Authorization: `Bearer ${token}` },
        data: {
            tableName : "Exams",
            idColumn  : "ExamID",
            idValue   : examID,
        }
    });

    return res.json({
        ok      : true,
        message : `Examen "${exam.Title}" eliminado correctamente`,
        examID,
    });
};