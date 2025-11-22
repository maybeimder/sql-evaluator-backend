// app/models/Auth.model.ts
// Este archivo solo sirve como consumidor de la API de ROBLE, resumida para mantener consistencia

import { robleClient } from "../connection/robleClient";

type VerifyTokenResponse = {
    valid: boolean,
    user: {
        sub       : string,
        email     : string,
        dbName    : string,
        role      : string,
        sessionId : string
    };
    expired : boolean;
}

type UserRegister = {
    _id       : string,
    UserID    : number,
    FullName  : string,
    Email     : string,
    CreatedAt : string,
    UpdatedAt : string,
    RobleID   : string
}


// Verifica el token de ROBLE
export async function verifyRobleToken (token: string) {
    try {
        const res = await robleClient("auth").get<VerifyTokenResponse>("/verify-token", {
            headers: { Authorization: `Bearer ${token}`}
        });

        return {
            valid: res.data.valid,
            user: res.data.user,
            expired: false
        }    

    } catch (error : any) {
        const output : string = error?.response?.data?.message || "";

        console.error("[ROBLE VERIFY ERROR]:", error)

        return {
            valid: false,
            user: null,
            expired: output.includes("Unauthorized")
        }
    }
}

// Toma un user basdao en el ROBLEID
export async function getUserID( token : string,  robleID : string ) {
    try {
        const res = await robleClient().get<Array<UserRegister>>("/read", {
            headers: { Authorization: `Bearer ${token}`},
            params: { tableName:"Users", RobleID: robleID }
        });

        return res.data[0] ?? null;

    } catch (error) {
        console.error("[ROBLE READ ERROR]:", error)
        return null;
    } 
}


// Lista los roles del usuario
export async function getUserRoles( token : string,  UserID : number ) {
    try {
        const res = await robleClient().get<Array<{UserID:string, RoleID:number}>>("/read", {
            headers: { Authorization: `Bearer ${token}`},
            params: { tableName:"UserRoles", UserID: UserID }
        });

        return res.data;

    } catch (error) {
        console.error("[ROBLE READ ROLES ERROR]:", error)
        return null;
    } 
}

// Refresca haciendo uso del refresh-token
export async function refreshRobleToken( refreshToken : string ) {
    if (!refreshToken) return null;
    
    try {
        const res = await robleClient().post<{ accessToken : string, refreshToken : string }>("/refresh-token", {
            refreshToken: refreshToken
        });

        return res.data;

    } catch (error) {
        console.error("[ROBLE READ ROLES ERROR]:", error)
        return null;
    } 
}




