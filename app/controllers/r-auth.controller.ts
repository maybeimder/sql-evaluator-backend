// app/controllers/r-auth.controller.ts
import { loginRoble, newRobleUser, verifyRobleEmail } from "../models/Auth.model";
import { getUserID, newUser, newUserRole } from "../models/Users.model";

import type { Controller } from "../types/types";

// [1] Registro de usuario
export const registerUser: Controller = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name)
            return res.status(400).json({ error: "Faltan campos" });

        const robleResponse = await newRobleUser(email, password, name)

        if (!robleResponse)
            return res.status(500).json({ error: "Error Inesperado" });

        // Harcoded de las responses de ROBLE
        if (robleResponse.message.includes("verificada"))
            return res.status(400).json({ error: robleResponse.message });

        if (robleResponse.message.includes("Revisa tu correo"))
            return res.json({ ok: true, message: robleResponse.message });

    } catch (e) {
        console.error("[REGISTER ERROR]", e)
        return res.status(500).json({ error: "[REGISTER ERROR] Error interno" });
    }
};


export const verifyEmail: Controller = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!code) return res.status(400).json({ error: "Código faltante" });

        // Verificar email en ROBLE
        const robleResponse = await verifyRobleEmail(email, code)

        if (robleResponse?.statusCode == 400)
            return res.json(robleResponse);

        return res.json({
            ok: true,
            message: robleResponse?.message
        });

    } catch (e) {
        console.error("[VERIFY EMAIL ERROR ERROR]", e)
        return res.status(500).json({ error: "[VERIFY EMAIL ERROR] Error interno" });
    }
};


export const loginUser: Controller = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: "Faltan Campos" });

        // Hacer login en roble
        const robleLoginResponse = await loginRoble(email, password);

        if (!robleLoginResponse || !robleLoginResponse.accessToken)
            return res.status(401).json({ error: "Credenciales inválidas" });

        // Guardar en una cookie el refresh token para mantener la sesion
        res.cookie("refreshToken", robleLoginResponse.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Checkear si ya existe ese usuario en la tabla Users (shadow)
        let shadowUser = await getUserID(robleLoginResponse.accessToken, robleLoginResponse.user.id)

        // Si no existe, registrarlo como estudiante
        if (!shadowUser) {
            shadowUser = await newUser(
                robleLoginResponse.accessToken,
                email,
                robleLoginResponse.user.name,
                robleLoginResponse.user.id
            )

            newUserRole(
                robleLoginResponse.accessToken, 
                robleLoginResponse.user.id, 
                [2]
            )
        };

        return res.json({
            ok: true,
            accessToken: robleLoginResponse.accessToken,
            refreshToken: robleLoginResponse.refreshToken,
            user: shadowUser,
        })

    } catch (e) {
        console.error("[LOGIN ERROR]", e);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};


export const logoutUser: Controller = (req, res) => {
    res.json({ message: "Logout OK" });
};

export const refreshToken: Controller = (req, res) => {
    res.json({ message: "Refresh Token OK" });
};
