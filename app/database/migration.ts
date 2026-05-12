// app/database/migrations.ts

import { pgPool } from "../connection/postgres.connection";
import Logger from "../utils/logger";

/**
 * Sistema de migraciones para la base de datos
 * Ejecuta scripts SQL para crear/actualizar tablas
 */

export async function runMigrations() {
  try {
    Logger.info("Iniciando migraciones de base de datos...");

    // Migración 001: Crear tabla Users
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Users" (
        "UserID" SERIAL PRIMARY KEY,
        "RobleID" INTEGER NOT NULL UNIQUE,
        "FullName" VARCHAR(150),
        "Email" VARCHAR(120),
        "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "UpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    Logger.success("✅ Tabla Users creada");

    // Migración 002: Crear tabla Roles
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Roles" (
        "RoleID" SERIAL PRIMARY KEY,
        "RoleName" VARCHAR(50) NOT NULL UNIQUE
      );
    `);
    Logger.success("✅ Tabla Roles creada");

    // Insertar roles por defecto
    await pgPool.query(`
      INSERT INTO "Roles" ("RoleID", "RoleName") VALUES 
        (1, 'ADMIN'),
        (2, 'PROFESSOR'),
        (3, 'STUDENT')
      ON CONFLICT DO NOTHING;
    `);
    Logger.success("✅ Roles inicializados");

    // Migración 003: Crear tabla UserRoles
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "UserRoles" (
        "UserID" INTEGER NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
        "RoleID" INTEGER NOT NULL REFERENCES "Roles"("RoleID") ON DELETE CASCADE,
        PRIMARY KEY ("UserID", "RoleID")
      );
    `);
    Logger.success("✅ Tabla UserRoles creada");

    // Migración 004: Crear tabla Databases
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Databases" (
        "DatabaseID" SERIAL PRIMARY KEY,
        "Name" VARCHAR(150) NOT NULL,
        "Description" TEXT,
        "DumpFilePath" TEXT,
        "UploadedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "UploadedBy" INTEGER REFERENCES "Users"("UserID") ON DELETE SET NULL
      );
    `);
    Logger.success("✅ Tabla Databases creada");

    // Migración 005: Crear tabla Exams
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Exams" (
        "ExamID" SERIAL PRIMARY KEY,
        "ProfessorID" INTEGER REFERENCES "Users"("UserID") ON DELETE SET NULL,
        "DatabaseID" INTEGER REFERENCES "Databases"("DatabaseID") ON DELETE SET NULL,
        "Title" VARCHAR(200) NOT NULL,
        "Description" TEXT,
        "StartTime" TIMESTAMP,
        "EndTime" TIMESTAMP,
        "AllowsRejoin" BOOLEAN DEFAULT FALSE,
        "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    Logger.success("✅ Tabla Exams creada");

    // Migración 006: Crear tabla ExamQuestions
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "ExamQuestions" (
        "QuestionID" SERIAL PRIMARY KEY,
        "ExamID" INTEGER NOT NULL REFERENCES "Exams"("ExamID") ON DELETE CASCADE,
        "QuestionText" TEXT NOT NULL,
        "Value" INTEGER DEFAULT 1,
        "OrderIndex" INTEGER,
        "ExpectedOutput" JSONB
      );
    `);
    Logger.success("✅ Tabla ExamQuestions creada");

    // Migración 007: Crear tabla Assignments
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Assignments" (
        "AssignmentID" SERIAL PRIMARY KEY,
        "StudentID" INTEGER NOT NULL REFERENCES "Users"("UserID") ON DELETE CASCADE,
        "ExamID" INTEGER NOT NULL REFERENCES "Exams"("ExamID") ON DELETE CASCADE,
        "SessionToken" UUID DEFAULT gen_random_uuid(),
        "StartedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "LastUpdatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "IsActive" BOOLEAN DEFAULT TRUE,
        "IsBlocked" BOOLEAN DEFAULT FALSE
      );
    `);
    Logger.success("✅ Tabla Assignments creada");

    // Migración 008: Crear tabla StudentAssignmentAnswers
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "StudentAssignmentAnswers" (
        "StudentAssignmentAnswerID" SERIAL PRIMARY KEY,
        "AssignmentID" INTEGER NOT NULL REFERENCES "Assignments"("AssignmentID") ON DELETE CASCADE,
        "QuestionID" INTEGER NOT NULL REFERENCES "ExamQuestions"("QuestionID") ON DELETE CASCADE,
        "Answer" TEXT,
        "AnswerOutput" JSONB,
        "ErrorMessage" TEXT,
        "IsCorrect" BOOLEAN,
        "SubmittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "LastModifiedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    Logger.success("✅ Tabla StudentAssignmentAnswers creada");

    // Migración 009: Crear tabla AuditLogs
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "AuditLogs" (
        "LogID" SERIAL PRIMARY KEY,
        "UserID" INTEGER REFERENCES "Users"("UserID") ON DELETE SET NULL,
        "ExamID" INTEGER REFERENCES "Exams"("ExamID") ON DELETE SET NULL,
        "Description" TEXT,
        "LoggedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "LogIP" VARCHAR(60),
        "UserAgent" TEXT
      );
    `);
    Logger.success("✅ Tabla AuditLogs creada");

    // Migración 010: Crear tabla Emails
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "Emails" (
        "EmailID" SERIAL PRIMARY KEY,
        "UserID" INTEGER REFERENCES "Users"("UserID") ON DELETE CASCADE,
        "Token" UUID DEFAULT gen_random_uuid(),
        "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "ExpiresAt" TIMESTAMP,
        "Used" BOOLEAN DEFAULT FALSE
      );
    `);
    Logger.success("✅ Tabla Emails creada");

    // Crear índices
    await pgPool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("Email");
      CREATE INDEX IF NOT EXISTS idx_users_roble_id ON "Users"("RobleID");
      CREATE INDEX IF NOT EXISTS idx_exams_professor ON "Exams"("ProfessorID");
      CREATE INDEX IF NOT EXISTS idx_assignments_student ON "Assignments"("StudentID");
      CREATE INDEX IF NOT EXISTS idx_answers_assignment ON "StudentAssignmentAnswers"("AssignmentID");
    `);
    Logger.success("✅ Índices creados");

    Logger.success("✅ Todas las migraciones completadas");
    return true;
  } catch (error) {
    Logger.error("❌ Error en migraciones", error);
    return false;
  }
}