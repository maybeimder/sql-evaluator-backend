// app/middlewares/errorHandler.middleware.ts
import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/errors.helper";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {

    console.error("===== 🛑 GLOBAL ERROR HANDLER =====");
    console.error("URL:", req.method, req.originalUrl);

    // ------------------------------
    // 1. Errores personalizados (HttpError)
    // ------------------------------
    if (err instanceof HttpError) {
        console.error("Custom Error:", {
            name   : err.name,
            msg    : err.message,
            status : err.statusCode,
            details: err.details ?? null
        });
        console.error("Stack:", err.stack);

        return res.status(err.statusCode).json({
            ok        : false,
            statusCode: err.statusCode,
            message   : err.message,
            details   : err.details || null
        });
    }

    // ------------------------------
    // 2. Errores de Axios (servicios externos: ROBLE, etc.)
    // ------------------------------
    if (err.isAxiosError) {
        const status = err.response?.status || 500;
        const data   = err.response?.data;

        console.error("Axios Error status:", status);
        console.error("Axios Error data:", data);
        console.error("Stack:", err.stack);

        return res.status(status).json({
            ok        : false,
            statusCode: data?.statusCode ?? status,
            message   : data?.message ?? "Error en servicio externo",
        });
    }

    // ------------------------------
    // 3. Errores de validación (Zod, Joi, etc.)
    // ------------------------------
    if (err.name === "ZodError") {
        console.error("Validation Error:", err.errors);
        console.error("Stack:", err.stack);

        return res.status(400).json({
            ok        : false,
            statusCode: 400,
            message   : "Error de validación",
            details   : err.errors
        });
    }

    // ------------------------------
    // 4. Error general no esperado
    // ------------------------------
    console.error("Unhandled Error object:", err);
    console.error("Stack:", err.stack);

    return res.status(500).json({
        ok        : false,
        statusCode: 500,
        message   : "Error interno del servidor"
    });
}
