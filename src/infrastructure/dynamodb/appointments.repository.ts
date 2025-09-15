import { DynamoDBClient, PutItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { AppointmentsTable } from "./appointments.table";

const ddb = new DynamoDBClient({});

export async function putPending(item: any) {
  await ddb.send(new PutItemCommand({
    TableName: AppointmentsTable.name,
    Item: marshall(item),
    ConditionExpression: "attribute_not_exists(appointmentId)"
  }));
}

export async function updateCompleted(key: { appointmentId: string; createdAt: string }) {
  await ddb.send(new UpdateItemCommand({
    TableName: AppointmentsTable.name,
    Key: { appointmentId: { S: key.appointmentId }, createdAt: { S: key.createdAt } },
    UpdateExpression: "SET #s=:s, lastUpdateAt=:t",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":s": { S: "completed" }, ":t": { S: new Date().toISOString() } }
  }));
}

export async function listByInsured(insuredId: string) {
  const res = await ddb.send(new QueryCommand({
    TableName: AppointmentsTable.name,
    IndexName: AppointmentsTable.gsi1,
    KeyConditionExpression: "insuredId = :i",
    ExpressionAttributeValues: { ":i": { S: insuredId } },
    ScanIndexForward: false,
    Limit: 50
  }));
  return (res.Items ?? []).map((it) => unmarshall(it));
}
