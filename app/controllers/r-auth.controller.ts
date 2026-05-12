// app/controllers/r-auth.controller.ts
import { deletePendingCode, getPendingCode, savePendingCode } from "../cache/pendingCache";
import { invalidateUserCache } from "../cache/userCache";
import { COOKIE_SETTINGS } from "../config/config";
import { loginRoble, newRobleMockUser, newRobleUser, verifyRobleEmail } from "../models/Auth.model";
import { getUserID, getUserRoles, newUser, newUserRole, UserRegister } from "../models/Users.model";

import type { Controller } from "../types/types";
import { performTokenRefresh } from "../utils/auth.helper";

import SessionService from "../services/session.service";
import StorageService from "../services/storage.service";
import Logger from "../utils/logger";

// [1] Registro de usuario
export const registerUser: Controller = async (req, res) => {

    const { email, password, name, code, role } : 
          { email:string, password:string, name:string, code:number, role:number|null } = req.body;

    if (!email || !password || !name || !code )
        return res.status(400).json({ error: "Faltan campos" });

    const robleResponse = await newRobleUser(email, password, name)

    if (!robleResponse)
        return res.status(500).json({ error: "Error Inesperado" });

    // Harcoded de las responses de ROBLE
    if (robleResponse.message.includes("verificada"))
        return res.status(400).json({ error: robleResponse.message });

    if (robleResponse.message.includes("Revisa tu correo"))
        savePendingCode(email, code, role)
        return res.json({ ok: true, message: robleResponse.message });

};

export const verifyEmail: Controller = async (req, res) => {

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

};

export const loginUser: Controller = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Faltan Campos" });
    
    // Hacer login en roble
    const robleLoginResponse = await loginRoble(email, password);
    if (!robleLoginResponse || !robleLoginResponse.accessToken)
        return res.status(401).json({ error: "Credenciales inválidas" });
    
    // Checkear si ya existe ese usuario en la tabla Users (shadow)
    let shadowUser : UserRegister | null = await getUserID(robleLoginResponse.accessToken, robleLoginResponse.user.RobleID)
    
    // Si no existe, registrarlo como estudiante
    if (!shadowUser) {
        const re = getPendingCode(email);
        if ( !re?.code )
            return res.status(400).json({ error: "Código no encontrado en cache" });
        shadowUser = await newUser(
            robleLoginResponse.accessToken,
            email,
            robleLoginResponse.user.name,
            robleLoginResponse.user.RobleID,
            re.code
        );
        if ( ! shadowUser )
            return res.status(500).json({ error: "No se pudo registrar usuario en DB" });
        newUserRole(
            robleLoginResponse.accessToken,
            shadowUser.UserID,
            re.role ? [re.role] : [3]
        );
        deletePendingCode(email);
    }
    
    // 🔥 OBTENER ROLES
    const roles = await getUserRoles(robleLoginResponse.accessToken, shadowUser.UserID);
    shadowUser.Roles = roles.map(r => r.RoleID);
    
    // ========== CREAR SESIÓN CON JWT ==========
    
    // 1. Crear sesión con JWT
    const session = SessionService.createSession({
        UserID: shadowUser.UserID,
        email: shadowUser.Email,
        roles: shadowUser.Roles
    });
    
    // 2. Guardar usuario en caché de storage
    StorageService.cacheUser(Number(shadowUser.UserID), {
        UserID: String(shadowUser.UserID),
        RobleID: String(shadowUser.RobleID),
        FullName: shadowUser.FullName,
        Email: shadowUser.Email,
        Roles: shadowUser.Roles,
        ExpiresAt: Date.now() + (5 * 60 * 1000) // 5 minutos
    });
    
    // 3. Guardar refresh token en cookie (más seguro que antes)
    res.cookie("refreshToken", session.refreshToken, {
        ...COOKIE_SETTINGS,
        maxAge: 24 * 60 * 60 * 1000,
    });
    
    Logger.success(`Usuario ${shadowUser.Email} inició sesión correctamente`);
    
    return res.json({
        ok: true,
        accessToken: session.accessToken,  // Token JWT del sistema
        user: {
            UserID: shadowUser.UserID,
            Email: shadowUser.Email,
            FullName: shadowUser.FullName,
            RobleID: shadowUser.RobleID,
            Roles: shadowUser.Roles
        }
    });
};



// ========== LOGOUT - NUEVA FUNCIÓN ==========

export const logoutUser: Controller = async (req, res) => {
    try {
        const authReq = req as { user?: { UserID?: string | number; email?: string } };
        const userID = authReq.user?.UserID;
        const email = authReq.user?.email;

        Logger.info(`Usuario ${email} está cerrando sesión`);

        // 1. Limpiar caché del usuario
        if (userID) {
            StorageService.deleteUser(String(userID));
            Logger.debug(`Caché limpiado para usuario ${userID}`);
        }

        // 2. Limpiar cookie de refresh token
        res.clearCookie("refreshToken", {
            ...COOKIE_SETTINGS
        });

        // 3. Limpiar pending codes si existen
        if (email) {
            deletePendingCode(email);
        }

        Logger.success(`Sesión cerrada para ${email}`);

        return res.json({
            ok: true,
            message: "Sesión cerrada correctamente"
        });
    } catch (error) {
        Logger.error("Error al cerrar sesión", error);
        return res.status(500).json({
            ok: false,
            message: "Error al cerrar sesión"
        });
    }
};

// ========== REFRESH TOKEN - MEJORADA ==========

export const refreshToken: Controller = async (req, res) => {
    try {
        const refreshTokenCookie = req.cookies?.refreshToken;

        if (!refreshTokenCookie) {
            return res.status(401).json({ 
                ok: false,
                error: "No hay token de refresco en la cookie" 
            });
        }

        // Verificar el refresh token
        const decoded = SessionService.verifyRefreshToken(refreshTokenCookie);

        if (!decoded) {
            res.clearCookie("refreshToken", COOKIE_SETTINGS);
            Logger.warn("Refresh token inválido o expirado");
            return res.status(401).json({
                ok: false,
                error: "Refresh token expirado, inicie sesión nuevamente"
            });
        }

        // Generar nuevo access token
        const newAccessToken = SessionService.generateAccessToken({
            UserID: decoded.UserID,
            email: decoded.email,
            roles: decoded.roles
        });

        // Opcionalmente, generar nuevo refresh token también
        const newRefreshToken = SessionService.generateRefreshToken({
            UserID: decoded.UserID,
            email: decoded.email,
            roles: decoded.roles
        });

        // Guardar nuevo refresh token en cookie
        res.cookie("refreshToken", newRefreshToken, {
            ...COOKIE_SETTINGS,
            maxAge: 24 * 60 * 60 * 1000
        });

        Logger.success(`Token refrescado para usuario ${decoded.UserID}`);

        return res.json({
            ok: true,
            accessToken: newAccessToken,
            message: "Token refrescado exitosamente"
        });
    } catch (error) {
        Logger.error("Error al refrescar token", error);
        return res.status(500).json({
            ok: false,
            error: "Error al refrescar token"
        });
    }
};

export const registerMockupUser: Controller = async (req, res) => {

    const { email, password, name, code, role } : 
          { email:string, password:string, name:string, code:number, role:number|null } = req.body;

    if (!email || !password || !name || !code )
        return res.status(400).json({ error: "Faltan campos" });

    const robleResponse = await newRobleMockUser(email, password, name)

    if (!robleResponse)
        return res.status(500).json({ error: "Error Inesperado" });

    savePendingCode(email, code, role)
    await loginUser(req, res)
    return res.json({ ok: true, message: robleResponse.message });

};
