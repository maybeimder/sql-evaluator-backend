// app/models/Users.model.ts
import crypto from "crypto";
import { robleClient } from "../connection/robleClient";


export type UserRegister = {
    UserID: string,
    FullName: string,
    Code: number,
    Email: string,
    CreatedAt: string,
    UpdatedAt: string,
    RobleID: string,
    Roles?: number[]
}

export async function newUser(token: string, email: string, name: string, robleID: string, code: number) {
    const newUserID = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await robleClient().post("/insert",
        {
            tableName: "Users",
            records: [
                {
                    UserID: newUserID,
                    FullName: name,
                    Code: code,
                    Email: email,
                    RobleID: robleID,
                    CreatedAt: now,
                    UpdatedAt: now
                }
            ]
        },
        {
            headers: { Authorization: "Bearer " + token }
        }
    );

    if (!res.data) {
        console.error("[ROBLE_INSERT_ERROR]", res.data);
        return null;
    }

    return {
        UserID: newUserID,
        FullName: name,
        Code: code,
        Email: email,
        RobleID: robleID,
        CreatedAt: now,
        UpdatedAt: now
    };
}

export async function newUserRole(token: string, userID: string, roles: number[]) {

    const records = roles.map(roleID => ({
        UserID: userID,
        RoleID: roleID
    }));

    await robleClient().post("/insert",
        {
            tableName: "UserRoles",
            records
        },
        {
            headers: { Authorization: "Bearer " + token }
        }
    );

    return true;

}
// Toma un user basado en el ROBLEID
export async function getUserID(token: string, robleID: string) {

    const res = await robleClient().get<Array<UserRegister>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Users", RobleID: robleID }
    });

    return res.data[0] ?? null;

}

// Lista los roles del usuario
export async function getUserRoles(token: string, UserID: string) {

    const res = await robleClient().get<Array<{ UserID: string, RoleID: number }>>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "UserRoles", UserID: UserID }
    });

    return res.data;

}

export async function getUsersListByRole(
    token: string,
    role: number | null = null
): Promise<UserRegister[]> {

    const client = robleClient();

    // ---------------------------------------
    // 1️⃣ SIN role → devolver todos los usuarios
    // ---------------------------------------
    if (role === null) {
        const usersRes = await client.get<UserRegister[]>("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
                tableName: "Users",
            },
        });

        return usersRes.data ?? [];
    }

    // ---------------------------------------
    // 2️⃣ CON role → buscar en UserRoles
    // ---------------------------------------
    const rolesRes = await client.get<{ UserID: string; RoleID: string }[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            tableName: "UserRoles",
            RoleID: role,
        },
    });

    const roles = rolesRes.data ?? [];

    if (roles.length === 0) return [];

    // Extraer IDs únicos
    const userIDs = Array.from(new Set(roles.map((r) => r.UserID)));

    // ---------------------------------------
    // 3️⃣ Traer todos los usuarios una sola vez
    // ---------------------------------------
    const usersRes = await client.get<UserRegister[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
            tableName: "Users",
        },
    });

    const users = usersRes.data ?? [];

    // ---------------------------------------
    // 4️⃣ Filtrar los que tengan el role
    // ---------------------------------------
    const allowed = new Set(userIDs);

    return users.filter((u) => allowed.has(u.UserID));
}

export async function getUserByID(token: string, userID: string): Promise<UserRegister | null> {
    const res = await robleClient().get<UserRegister[]>("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Users", UserID: userID }
    });

    return res.data?.[0] ?? null;
}
