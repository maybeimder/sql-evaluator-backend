// app/models/Users.model.ts
import crypto from "crypto";
import { robleClient } from "../connection/robleClient";

type UserRegister = {
    UserID: string,
    FullName: string,
    Email: string,
    CreatedAt: string,
    UpdatedAt: string,
    RobleID: string
}


export async function newUser(token: string, email: string, name: string, robleID: string) {
    try {
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
    } catch (error) {
        console.error("[SHADOW USER INSERT ERROR]:", error);
        return null;
    }
}


export async function newUserRole( token:string, userID:string, roles:number[] ) {
    try {
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

    } catch (error) {
        console.error("[INSERT USER ROLES ERROR]:", error);
        return false;
    }
}

// Toma un user basado en el ROBLEID
export async function getUserID(token: string, robleID: string) {
    try {
        const res = await robleClient().get<Array<UserRegister>>("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: { tableName: "Users", RobleID: robleID }
        });

        return res.data[0] ?? null;

    } catch (error) {
        console.error("[ROBLE READ ERROR]:", error)
        return null;
    }
}


// Lista los roles del usuario
export async function getUserRoles(token: string, UserID: string) {
    try {
        const res = await robleClient().get<Array<{ UserID: string, RoleID: number }>>("/read", {
            headers: { Authorization: `Bearer ${token}` },
            params: { tableName: "UserRoles", UserID: UserID }
        });

        return res.data;

    } catch (error) {
        console.error("[ROBLE READ ROLES ERROR]:", error)
        return null;
    }
}
