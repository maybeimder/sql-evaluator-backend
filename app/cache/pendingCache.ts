const pendingMap = new Map<string, {code:number, role:number|null, expires:number}>();

export function savePendingCode(email: string, code: number, role:number|null=null) {
    pendingMap.set(email, {
        code,
        role,
        expires: Date.now() + (5 * 60 * 1000)
    });
}

export function getPendingCode(email: string) {
    const entry = pendingMap.get(email);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
        pendingMap.delete(email);
        return null;
    }

    return { code: entry.code, role:entry.role };
}

export function deletePendingCode(email: string) {
    pendingMap.delete(email);
}
