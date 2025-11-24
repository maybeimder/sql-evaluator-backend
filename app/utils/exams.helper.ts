export function addMinutes(dateString: string, minutes: number): string {
    const date = new Date(dateString);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toISOString();
}