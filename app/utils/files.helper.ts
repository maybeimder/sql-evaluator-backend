// app/utils/files.helper.ts

import fs from "fs";
import path from "path";

export function moveToUploads(tempPath: string, originalName: string) {
    const dest = path.join(
        "/home/der/homelab/databases/PostgreSQL/teacherUploads/",
        originalName
    );

    fs.renameSync(tempPath, dest);
    return dest;
}

export function getFilename(fullPath: string) {
    return fullPath.split("/").pop()!;
}
