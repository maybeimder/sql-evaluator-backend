import Logger from "../utils/logger";

/**
 * Servicio de IA local usando Ollama
 * No depende de servicios externos
 */

export class AIService {
  private static OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
  private static MODEL = process.env.AI_MODEL || "mistral"; // modelo local

  /**
   * Generar enunciado de examen
   */
  static async generateExamStatement(topic: string, difficulty: string): Promise<string> {
    try {
      Logger.info(`Generando enunciado: tema=${topic}, dificultad=${difficulty}`);

      const prompt = `Genera un enunciado de examen de SQL sobre ${topic} con dificultad ${difficulty}. 
      El enunciado debe ser claro y específico. 
      Responde solo con el enunciado, sin explicaciones adicionales.`;

      const response = await this.callOllama(prompt);
      Logger.success(`Enunciado generado correctamente`);
      return response;
    } catch (error) {
      Logger.error("Error generando enunciado", error);
      throw error;
    }
  }

  /**
   * Generar casos de prueba
   */
  static async generateTestCases(examStatement: string): Promise<any[]> {
    try {
      Logger.info(`Generando casos de prueba para enunciado`);

      const prompt = `Basado en este enunciado de examen SQL: "${examStatement}"
      
      Genera 3 casos de prueba en formato JSON con la siguiente estructura:
      [
        {
          "input": "consulta SQL esperada",
          "expectedOutput": "resultado esperado",
          "description": "descripción del caso"
        }
      ]
      
      Responde SOLO con el JSON, sin explicaciones.`;

      const response = await this.callOllama(prompt);
      
      // Parsear la respuesta JSON
      const testCases = JSON.parse(response);
      Logger.success(`${testCases.length} casos de prueba generados`);
      return testCases;
    } catch (error) {
      Logger.error("Error generando casos de prueba", error);
      throw error;
    }
  }

  /**
   * Generar solución esperada
   */
  static async generateExpectedSolution(examStatement: string): Promise<string> {
    try {
      Logger.info(`Generando solución esperada`);

      const prompt = `Basado en este enunciado de examen SQL: "${examStatement}"
      
      Genera la consulta SQL que resuelve correctamente el problema.
      Responde SOLO con la consulta SQL, sin explicaciones.`;

      const response = await this.callOllama(prompt);
      Logger.success(`Solución esperada generada`);
      return response;
    } catch (error) {
      Logger.error("Error generando solución", error);
      throw error;
    }
  }

  /**
   * Validar respuesta del estudiante
   */
  static async validateStudentAnswer(expectedSolution: string, studentAnswer: string): Promise<{ isCorrect: boolean; feedback: string }> {
    try {
      Logger.info(`Validando respuesta del estudiante`);

      const prompt = `Compara estas dos consultas SQL:
      
      Solución esperada:
      ${expectedSolution}
      
      Respuesta del estudiante:
      ${studentAnswer}
      
      Determina si la respuesta es correcta y proporciona feedback en formato JSON:
      {
        "isCorrect": true/false,
        "feedback": "explicación del resultado"
      }
      
      Responde SOLO con el JSON.`;

      const response = await this.callOllama(prompt);
      const result = JSON.parse(response);
      Logger.success(`Validación completada: isCorrect=${result.isCorrect}`);
      return result;
    } catch (error) {
      Logger.error("Error validando respuesta", error);
      throw error;
    }
  }

  /**
   * Llamar a Ollama (función interna)
   */
  private static async callOllama(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${this.OLLAMA_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.MODEL,
          prompt: prompt,
          stream: false,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        Logger.error(`Error de Ollama: ${response.status}`, response.statusText);
        throw new Error(`Ollama error: ${response.status}`);
      }

      const data = await response.json();
      return data.response.trim();
    } catch (error) {
      Logger.error("Error conectando con Ollama", error);
      throw error;
    }
  }

  /**
   * Verificar que Ollama está disponible
   */
  static async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.OLLAMA_URL}/api/tags`, {
        method: "GET",
      });

      if (response.ok) {
        Logger.success(`✅ Ollama disponible en ${this.OLLAMA_URL}`);
        return true;
      }
      Logger.warn(`⚠️ Ollama no responde correctamente`);
      return false;
    } catch (error) {
      Logger.error(`⚠️ No se pudo conectar a Ollama en ${this.OLLAMA_URL}`, error);
      return false;
    }
  }
}

export default AIService;