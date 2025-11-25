// app/controllers/r-users.controller.ts
import { getUsersListByRole } from "../models/Users.model";
import type { Controller } from "../types/types";

export const getUserList: Controller = (req, res) => {
    res.json({ message: "Listar usuarios" });
};

export const createUser: Controller = (req, res) => {
    res.json({ message: "New User" });
};

export const getUserByID: Controller = (req, res) => {
    res.json({ message: "Get user by ID" });
};

export const editUserRolesByID: Controller = async (req, res) => {
};

export const getUserListWithRole: Controller = async (req, res) => {
    const token = req.auth.token;
    
    if (!token)
        return res.status(400).json({ error: "No se pudo validar el token" });

    const { roleID } = req.params;

    const numericRole = Number(roleID);
    if (Number.isNaN(numericRole)) {
        return res.status(400).json({
            ok: false,
            message: "roleID debe ser un número",
        });
    }

    // Opcional: validar rango permitido
    if (![1, 2, 3].includes(numericRole)) {
        return res.status(400).json({
            ok: false,
            message: "roleID inválido",
        });
    }

    const users = await getUsersListByRole(token, numericRole);

    return res.json({
        ok: true,
        roleID: numericRole,
        count: users.length,
        users,
    });
};