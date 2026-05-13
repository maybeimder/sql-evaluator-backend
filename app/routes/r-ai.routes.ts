// app/routes/r-ai.routes.ts

import { Router } from "express";
import type { Controller } from "../types/types";
import AIService from "../services/ai.service";
import DependencyCheckService from "../services/dependency-check.service";
import Logger from "../utils/logger";
import { getAILogs, clearAILogs } from "../middlewares/ai-logger.middleware";

const router = Router();

// Generar enunciado
const generateStatement: Controller = async (req, res) => {
  try {
    const { topic, difficulty } = req.body;

    if (!topic || !difficulty) {
      return res.status(400).json({ error: "Faltan parámetros: topic, difficulty" });
    }

    const statement = await AIService.generateExamStatement(topic, difficulty);

    return res.json({
      ok: true,
      statement
    });
  } catch (error) {
    Logger.error("Error generando enunciado", error);
    return res.status(500).json({ error: "Error generando enunciado" });
  }
};

// Generar casos de prueba
const generateTestCases: Controller = async (req, res) => {
  try {
    const { examStatement } = req.body;

    if (!examStatement) {
      return res.status(400).json({ error: "Falta parámetro: examStatement" });
    }

    const testCases = await AIService.generateTestCases(examStatement);

    return res.json({
      ok: true,
      testCases
    });
  } catch (error) {
    Logger.error("Error generando casos de prueba", error);
    return res.status(500).json({ error: "Error generando casos de prueba" });
  }
};

// Validar respuesta
const validateAnswer: Controller = async (req, res) => {
  try {
    const { expectedSolution, studentAnswer } = req.body;

    if (!expectedSolution || !studentAnswer) {
      return res.status(400).json({ error: "Faltan parámetros: expectedSolution, studentAnswer" });
    }

    const validation = await AIService.validateStudentAnswer(expectedSolution, studentAnswer);

    return res.json({
      ok: true,
      validation
    });
  } catch (error) {
    Logger.error("Error validando respuesta", error);
    return res.status(500).json({ error: "Error validando respuesta" });
  }
};

// Verificar dependencias
const checkDependencies: Controller = async (req, res) => {
  try {
    const report = await DependencyCheckService.generateDependencyReport();

    return res.json({
      ok: true,
      report
    });
  } catch (error) {
    Logger.error("Error verificando dependencias", error);
    return res.status(500).json({ error: "Error verificando dependencias" });
  }
};

// Ver logs de IA
const viewLogs: Controller = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const logs = getAILogs(limit);

    return res.json({
      ok: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    Logger.error("Error leyendo logs", error);
    return res.status(500).json({ error: "Error leyendo logs" });
  }
};

// Limpiar logs
const clearLogs: Controller = async (req, res) => {
  try {
    const success = clearAILogs();

    return res.json({
      ok: success,
      message: success ? "Logs limpios" : "No hay logs para limpiar"
    });
  } catch (error) {
    Logger.error("Error limpiando logs", error);
    return res.status(500).json({ error: "Error limpiando logs" });
  }
};

router.post("/generate-statement", generateStatement);
router.post("/generate-test-cases", generateTestCases);
router.post("/validate-answer", validateAnswer);
router.get("/dependencies", checkDependencies);
router.get("/logs", viewLogs);
router.delete("/logs", clearLogs);

export default router;