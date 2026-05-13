// app/utils/normalizer.helper.ts

// Normaliza un string SQL para comparaciones, eliminando diferencias de formato, capitalización y espacios
export function normalizeSQL(input: string | null | undefined): string {
    if (!input) return "";

    return input
        .toLowerCase()                          // Convierte a minúsculas
        .replace(/\s+/g, " ")                   // Colapsa espacios/tabs/saltos en uno solo
        .replace(/\s*,\s*/g, ",")               // Elimina espacios alrededor de comas
        .replace(/\s*=\s*/g, "=")               // Elimina espacios alrededor de igual
        .replace(/\s*>\s*/g, ">")               // Elimina espacios alrededor de >
        .replace(/\s*<\s*/g, "<")               // Elimina espacios alrededor de 
        .replace(/;+$/, "")                     // Elimina punto y coma al final
        .trim();                                // Elimina espacios al inicio y al final
}

//Normaliza un conjunto de filas de resultados de SQL para comparaciones, ordenando columnas y estandarizando valores
export function normalizeResultSet(rows: Record<string, any>[]): string {
    if (!rows || rows.length === 0) return "[]";

    const normalized = rows.map(row => {
        const normalizedRow: Record<string, string> = {};

        for (const key of Object.keys(row).sort()) {        // Ordena columnas alfabéticamente
            const value = row[key];
            normalizedRow[key.toLowerCase()] =              // Clave en minúsculas
                value === null || value === undefined
                    ? "null"
                    : String(value).toLowerCase().trim();   // Valor en minúsculas y sin espacios
        }

        return normalizedRow;
    });

    return JSON.stringify(normalized);
}