import { NodeSSH } from "node-ssh";
import dotenv from "dotenv";
dotenv.config();

const ssh = new NodeSSH();

export async function runRemote(cmd: string) {
    await ssh.connect({
        host: process.env.SV_HOST,
        username: process.env.SV_USER,
        password: process.env.SV_PASSWORD
    });

    const result = await ssh.execCommand(cmd);

    // Solo considerar error si contiene "ERROR:" (fatal)
    if (result.stderr && result.stderr.includes("ERROR")) {
        console.error("Remote ERROR:", result.stderr);
        throw new Error(result.stderr);
    }

    // Si tiene NOTICE, es normal
    if (result.stderr && result.stderr.includes("NOTICE")) {
        console.warn("Remote NOTICE:", result.stderr);
    }

    return result.stdout;
}
