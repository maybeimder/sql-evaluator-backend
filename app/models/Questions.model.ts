import crypto from "crypto";
import { robleClient } from "../connection/robleClient";

export type QuestionRegister = {
    QuestionID: string,
    ExamID: string,
    QuestionTitle: string,
    QuestionText: string | null,
    ExpectedOutput: any | null,
    SolutionExample: string | null,
    Value: number | null
}

export type NewQuestionInput = {
    ExamID: string,
    QuestionTitle: string,
    QuestionText: string | null,
    ExpectedOutput: any | null,
    Inputs? : any | null
    SolutionExample: string | null,
    Value: number | null
};

export async function newQuestions(
    token: string,
    questions: NewQuestionInput[]
): Promise<QuestionRegister[] | null> {

    if (!questions || questions.length === 0)
        return [];

    const now = new Date().toISOString();

    const records = questions.map(q => ({
        QuestionID: crypto.randomUUID(),
        ExamID: q.ExamID,
        QuestionTitle: q.QuestionTitle,
        QuestionText: q.QuestionText,
        ExpectedOutput: q.ExpectedOutput,
        SolutionExample: q.SolutionExample,
        Value: q.Value,
    }));

    const res = await robleClient().post("/insert",
        {
            tableName: "ExamQuestions",
            records
        },
        {
            headers: { Authorization: "Bearer " + token }
        }
    );

    return records;
}

export async function getQuestionsByExam(token: string, examID: string) {
    const res = await robleClient().get<Array<QuestionRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "ExamQuestions", ExamID: examID }
    });

    return res.data ?? [];
}

export async function getQuestionByID(
    token: string,
    questionID: string
): Promise<QuestionRegister | null> {

    const res = await robleClient().get<Array<QuestionRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "ExamQuestions", QuestionID: questionID }
    });

    const questions = res.data ?? [];
    return questions.length > 0 ? questions[0] : null;
}
