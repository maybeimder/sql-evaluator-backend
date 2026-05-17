import { robleClient } from "../connection/robleClient";

export type GroupRegister = {
    GroupID: string,
    ProfessorID: string,
    GroupName: string,
    CreatedAt: string,
};

export async function newGroup(
    token: string,
    professorID: string,
    groupName: string
): Promise<GroupRegister | null> {
    const newGroupID = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await robleClient().post("/insert", {
        tableName: "Groups",
        records: [
            {
                GroupID: newGroupID,
                ProfessorID: professorID,
                GroupName: groupName,
                CreatedAt: now,
            }
        ]
    }, {
        headers: { Authorization: "Bearer " + token }
    });

    console.log("[newGroup] roble response:", res.status, res.data);

    return {
        GroupID: newGroupID,
        ProfessorID: professorID,
        GroupName: groupName,
        CreatedAt: now,
    }

}

export async function listProfessorGroups(token: string, professorID: string): Promise<GroupRegister[]> {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Groups", ProfessorID: professorID }
    });

    return res.data ?? [];
}

export async function listAllGroups(token: string, adminID: string): Promise<GroupRegister[]> {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Groups" }
    });

    return res.data ?? [];
}

export async function getGroupByID(token: string, groupID: string): Promise<GroupRegister | null> {
    const res = await robleClient().get("/read", {
        headers: { Authorization: `Bearer ${token}` },
        params: { tableName: "Groups", GroupID: groupID }
    });

    return res.data ?? null;
}


