const pendingMap = new Map<string, {code:number, expires:number}>();

export function savePendingCode(email: string, code: number) {
    pendingMap.set(email, {
        code,
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

    return entry.code;
}

export function deletePendingCode(email: string) {
    pendingMap.delete(email);
}
