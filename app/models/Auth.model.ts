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

// Crear un nuevo usuario en ROBLE
export async function newRobleUser ( email:string, password:string, name:string ) 
: Promise<{ statusCode:number; message:string } | null> {
    try {
        const res = await robleClient("auth").post("/signup", {
            email: email,
            password: password,
            name: name
        });

        return {
            statusCode: res.status, 
            message: res.data?.message
        }
    
    } catch (error) {
        console.error("[ROBLE REGISTER ERROR]:", error)
        return null;
    } 
}


// Verifica el codigo de confirmación de un usuario
export async function verifyRobleEmail( email:string, code:number ) {
    try {
        const res = await robleClient("auth").post("/verify-email", {
            email: email,
            code: code
        });

        return {
            statusCode: res.status, 
            message: res.data?.message
        }
    } catch (error) {
        console.error("[ROBLE VERIFY ERROR]:", error)
        return null;
    }
}


export async function loginRoble ( email:string, password:string ) {
    try {
        const result : {
            data : {
                accessToken    : string,
                refreshToken  : string,
                user: {
                    id        : string,
                    role      : string,
                    name      : string
                }
            } 
        } = await robleClient("auth").post("/login", {
            email: email,
            password: password
        }); 

        const { accessToken, refreshToken, user } = result.data;
        
        if ( ! refreshToken || ! accessToken || ! user ) 
            return null;

        return result.data
        
    } catch (error) {
        console.error("[ROBLE LOGIN ERROR]:", error)
        return null;
    }
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




