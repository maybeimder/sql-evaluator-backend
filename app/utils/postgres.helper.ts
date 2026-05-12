import { runRemote } from "../connection/remoteExec";

export async function createDatabase(dbName: string) {
    await runRemote(`
        docker exec postgres-exam createdb -U admin ${dbName}
    `);
}

export async function restoreSQL(dbName: string, dumpName: string) {
    await runRemote(`
        docker exec -i postgres-exam psql -U admin -d ${dbName} -f "/teacher_uploads/${dumpName}"
    `);
}

export async function restoreTAR(dbName: string, dumpName: string) {
    await runRemote(`
        docker exec postgres-exam pg_restore -U admin -d ${dbName} "/teacher_uploads/${dumpName}"
    `);
}

export function generateDBName() {
    return Date.now().toString();
}

export async function deleteDumpFile(dumpName: string) {
    await runRemote(`
        rm -f /teacher_uploads/${dumpName}
    `);
}

export async function dropDatabase(dbID: string) {
    await runRemote(`
        docker exec postgres-exam dropdb -U admin ${dbID}
    `);
}

