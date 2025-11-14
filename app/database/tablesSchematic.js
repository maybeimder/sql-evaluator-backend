// app/database/tablesSchematic.js
const schematics = {
    "users": {
        tableName: "Users",
        description: "UserTable",
        columns: [
            { name: "UserID", type: "integer", isPrimary: true },
            { name: "FullName", type: "varchar(150)" },
            { name: "Email", type: "varchar(120)" },
            { name: "PasswordHash", type: "text" },
            { name: "CreatedAt", type: "timestamp"},
            { name: "UpdatedAt", type: "timestamp"},
        ],
    },

    "roles": {
        tableName: "Roles",
        description: "RolesTable",
        columns: [
            { name: "RoleID", type: "integer", isPrimary: true },
            { name: "RoleName", type: "varchar(50)" },
        ],
    },

    "user_roles": {
        tableName: "UserRoles",
        description: "UserRolesTable",
        columns: [
            { name: "UserID", type: "integer", isPrimary: true},
            { name: "RoleID", type: "integer", isPrimary: true},
        ],
    },

    "databases": {
        tableName: "Databases",
        description: "DatabasesTable",
        columns: [
            { name: "DatabaseID", type: "integer", isPrimary: true },
            { name: "Name", type: "varchar(150)" },
            { name: "Description", type: "text" },
            { name: "DumpFilePath", type: "text" },
            { name: "UploadedAt", type: "timestamp"},
            { name: "UploadedBy", type: "integer"},
        ],
    },

    "exams": {
        tableName: "Exams",
        description: "ExamsTable",
        columns: [
            { name: "ExamID", type: "integer", isPrimary: true },
            { name: "ProfessorID", type: "integer"},
            { name: "DatabaseID", type: "integer"},
            { name: "Title", type: "varchar(200)"},
            { name: "Description", type: "text" },
            { name: "StartTime", type: "timestamp"},
            { name: "EndTime", type: "timestamp" },
            { name: "AllowsRejoin", type: "bool"},
            { name: "CreatedAt", type: "timestamp"},
        ],
    },

    "exam_questions": {
        tableName: "ExamQuestions",
        description: "ExamQuestionsTable",
        columns: [
            { name: "QuestionID", type: "integer", isPrimary: true },
            { name: "ExamID", type: "integer"},
            { name: "QuestionText", type: "text" },
            { name: "Value", type: "integer"},
            { name: "OrderIndex", type: "integer" },
            { name: "ExpectedOutput", type: "jsonb" },
        ],
    },

    "assignments": {
        tableName: "Assignments",
        description: "AssignmentsTables",
        columns: [
            { name: "AssignmentID", type: "integer", isPrimary: true },
            { name: "StudentID", type: "integer"},
            { name: "ExamID", type: "integer"},
            { name: "SessionToken", type: "uuid" },
            { name: "StartedAt", type: "timestamp" },
            { name: "LastUpdatedAt", type: "timestamp" },
            { name: "IsActive", type: "bool"},
            { name: "IsBlocked", type: "bool"},
        ],
    },

    "student_assignment_answers": {
        tableName: "StudentAssignmentAnswers",
        description: "StudentAssignmentAnswersTables",
        columns: [
            { name: "StudentAssignmentAnswerID", type: "integer", isPrimary: true },
            { name: "AssignmentID", type: "integer"},
            { name: "QuestionID", type: "integer"},
            { name: "Answer", type: "text" },
            { name: "AnswerOutput", type: "jsonb" },
            { name: "ErrorMessage", type: "text" },
            { name: "IsCorrect", type: "bool" },
            { name: "SubmittedAt", type: "timestamp"},
            { name: "LastModifiedAt", type: "timestamp"},
        ],
    },

    "audit_logs": {
        tableName: "AuditLogs",
        description: "AuditLogsTables",
        columns: [
            { name: "LogID", type: "integer", isPrimary: true },
            { name: "UserID", type: "integer"},
            { name: "ExamID", type: "integer" },
            { name: "Description", type: "text" },
            { name: "LoggedAt", type: "timestamp"},
            { name: "LogIP", type: "varchar(60)" },
            { name: "UserAgent", type: "text" },
        ],
    },

    "emails": {
        tableName: "Emails",
        description: "EmailsTable",
        columns: [
            { name: "EmailID", type: "integer", isPrimary: true },
            { name: "UserID", type: "integer"},
            { name: "Token", type: "uuid" },
            { name: "CreatedAt", type: "timestamp"},
            { name: "ExpiresAt", type: "timestamp" },
            { name: "Used", type: "bool"},
        ]
    }

}

export default schematics;