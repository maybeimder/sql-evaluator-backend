// createMockExams.js

const API_URL = "http://localhost:3000"; 
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhMWI5MWY3OS1jMzY5LTRiZmUtYmVmZC0zMGZhOTdiNTJmZjUiLCJlbWFpbCI6ImpvbmhmZXJyZXJhdmlsYThAZ21haWwuY29tIiwiZGJOYW1lIjoiZGJzc3FsZXZhbHVhdG9yXzY1YzBmNmFmMDQiLCJyb2xlSWQiOiI3YWU0YjRiZi1lZWM1LTRjNTctODAxYy04ODIzMGQwOGZjOTIiLCJyb2xlIjoiREJfT1dORVIiLCJzZXNzaW9uSWQiOiI1YzEwMmUzYy1iMDI4LTQ0NDQtOTQxOC0xMWNmODRlYTRlZjIiLCJpYXQiOjE3NjQwNDQ4OTMsImV4cCI6MTc2NDA0NTc5M30.LhMrPvnd29xhQnnbkQ0yCD_bEvO6chfY5OwS2JdoGpQ";
const STUDENT_ID = "d9c7efe9-709e-41f8-9a9f-b55600f025ad";

// Helper para esperar
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function createFiveExams() {
    for (let i = 1; i <= 10; i++) {

        const examPayload = {
            Title: `Examen Demo ${i}`,
            Description: "Examen generado automáticamente para pruebas",
            StartTime: new Date().toISOString(),
            Duration: 45,
            DatabaseID: null,
            AllowsRejoin: true,
            questions: [
                {
                    QuestionTitle: "List all customers",
                    QuestionText: "SELECT * FROM Customers;",
                    ExpectedOutput: "Any rows",
                    SolutionExample: "SELECT * FROM Customers;",
                    Value: 2
                },
                {
                    QuestionTitle: "Top 5 products",
                    QuestionText: "SELECT TOP 5 * FROM Products ORDER BY Price DESC;",
                    ExpectedOutput: "5 rows",
                    SolutionExample: "SELECT TOP 5 * FROM Products ORDER BY Price DESC;",
                    Value: 3
                },
                {
                    QuestionTitle: "Count orders",
                    QuestionText: "SELECT COUNT(*) FROM Orders;",
                    ExpectedOutput: "Any numeric value",
                    SolutionExample: "SELECT COUNT(*) FROM Orders;",
                    Value: 1
                }
            ]
        };

        console.log(`📝 Creating exam ${i}...`);

        // 1) Crear examen
        const examRes = await fetch(`${API_URL}/exams`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify(examPayload)
        });

        const examData = await examRes.json();
        console.log("Exam created:", examData.exam?.ExamID);

        if (!examData.exam) {
            console.error("❌ Failed creating exam", examData);
            continue;
        }

        const examID = examData.exam.ExamID;

        // 2) Crear assignment para el estudiante
        console.log("👤 Assigning exam to student...");

        const assignmentRes = await fetch(`${API_URL}/assignments`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                ExamID: examID,
                StudentID: STUDENT_ID
            })
        });

        const assignData = await assignmentRes.json();
        console.log("Assignment result:", assignData);

        // Delay opcional (evita saturar)
        await delay(300);
    }

    console.log("✅ All 5 exams and assignments created!");
}

createFiveExams().catch(console.error);
