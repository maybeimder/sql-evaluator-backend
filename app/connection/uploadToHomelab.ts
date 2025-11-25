import SftpClient from "ssh2-sftp-client";
import dotenv from "dotenv";
dotenv.config();

export async function uploadToHomelab(localPath: string, remoteName: string) {
    const sftp = new SftpClient();

    await sftp.connect({
        host: process.env.SV_HOST,     
        username: process.env.SV_USER, 
        password: process.env.SV_PASSWORD
    });

    await sftp.put(
        localPath,
        `/home/der/homelab/databases/PostgreSQL/teacherUploads/${remoteName}`
    );

    await sftp.end();
}
