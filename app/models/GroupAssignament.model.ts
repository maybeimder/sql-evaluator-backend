import { robleClient } from "../connection/robleClient";

export type GroupAssignmentRegister = {
    GroupAssignmentID: string,
    GroupID: string,
    PersonID: string,
    AssignationDate: string,
};

export async function newGroupAssignment(
    token: string,
    groupID: string,
    personID: string,
    assignationDate: string
): Promise<GroupAssignmentRegister | null> {
    const newGroupAssignmentID = crypto.randomUUID();
    const now = new Date().toISOString();

    const res = await robleClient().post("/insert", {
        tableName: "GroupAssignment",
        records: [
            {
                GroupAssignmentID: newGroupAssignmentID,
                GroupID: groupID,
                PersonID: personID,
                AssignationDate: now,
            }
        ]
    }, {
        headers: { Authorization: "Bearer " + token }
    });

    console.log("[newGroupAssignment] roble response:", res.status, res.data);

    return {
        GroupAssignmentID: newGroupAssignmentID,
        GroupID: groupID,
        PersonID: personID,
        AssignationDate: now,
    }
}
