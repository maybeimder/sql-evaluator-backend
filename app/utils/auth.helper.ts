import { getUserCache, setUserCache } from "../cache/userCache";
import { COOKIE_SETTINGS } from "../config/config";
import { refreshRobleToken, verifyRobleToken } from "../models/Auth.model";
import { getUserID, getUserRoles } from "../models/Users.model";


export async function performTokenRefresh(refreshToken?: string, res?: any) {
    if (!refreshToken) return null;

    const refreshed = await refreshRobleToken(refreshToken);

    if (!refreshed) {
        res?.clearCookie("refreshToken", {  // ← optional chaining por si res es undefined
            ...COOKIE_SETTINGS,
            maxAge: 0
        });
        return null;
    }

    res?.cookie("refreshToken", refreshed.refreshToken, {
        ...COOKIE_SETTINGS,
        maxAge: 24 * 60 * 60 * 1000,
    });

    const toValidate = await verifyRobleToken(refreshed.accessToken);

    if (!toValidate.valid || !toValidate.user) return null;  // ← && → || (ambos deben cumplirse)

    return {
        newToken: refreshed.accessToken,
        user: toValidate.user,
    };
}

export async function loadUserToCache(token: string, robleUser: any) {
    const alreadyCached = getUserCache(robleUser.sub);

    if (alreadyCached) {
        return alreadyCached;

    } else {
        // Buscar usuario por ID en ROBLE
        const user = await getUserID(token, robleUser.sub)
        if (!user) return null;

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

