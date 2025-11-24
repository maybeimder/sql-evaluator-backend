// app/models/Users.model.ts
import crypto from "crypto";
import { robleClient } from "../connection/robleClient";


export type UserRegister = {
    UserID: string,
    FullName: string,
    Email: string,
    CreatedAt: string,
    UpdatedAt: string,
    RobleID: string
}


export async function newUser(token: string, email: string, name: string, robleID: string) {
    const newUserID = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await robleClient().post("/insert",
        {
            tableName: "Users",
            records: [
                {
                    UserID: newUserID,
                    FullName: name,
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

    return {
        UserID: newUserID,
        FullName: name,
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
