import { getUserCache, setUserCache } from "../cache/userCache";
import { refreshRobleToken, verifyRobleToken } from "../models/Auth.model";
import { getUserID, getUserRoles } from "../models/Users.model";


export async function performTokenRefresh(refreshToken?: string, res?: any) {
    if ( ! refreshToken ) return null;

    const refreshed = await refreshRobleToken(refreshToken);
    if (!refreshed) { return null }

    // Guardar en cookie dinamicamente los refresh tokens
    res.cookie("refreshToken", refreshed.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Validar el nuevo access token obetenido
    const toValidate = await verifyRobleToken(refreshed.accessToken);

    if (!toValidate.valid && !toValidate.user) { return null }
    
    return {
        newToken: refreshed.accessToken,
        user: toValidate.user,
    }
}


export async function loadUserToCache( token:string, robleUser:any ) {
    const alreadyCached = getUserCache(robleUser.sub);
    
    if (alreadyCached) { 
        return alreadyCached; 
    
    } else {
        // Buscar usuario por ID en ROBLE
        const user = await getUserID(token, robleUser.sub)
        if ( ! user ) return null;

        const userRoles = await getUserRoles(token, user?.UserID);
        const roles = Array.isArray(userRoles) ? userRoles.map(r => r.RoleID) : [];

        const cache = {
            UserID: user?.UserID,
            RobleID: user?.RobleID,
            FullName: user?.FullName,
            Email: user?.Email,
            Roles: roles
        };

        setUserCache(robleUser.sub, cache);

        return getUserCache(robleUser.sub);
    }
}

