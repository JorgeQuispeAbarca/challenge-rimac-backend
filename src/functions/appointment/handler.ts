import type { APIGatewayProxyResultV2, SQSEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { http } from "../../shared/utils";
import { CreateAppointmentSchema } from "./schema";
import { env } from "../../infrastructure/config/env";
import { createAppointment } from "../../application/create-appointment.usecase";
import { listAppointmentsByInsured } from "../../application/list-appointments-by-insured.usecase";
import { updateStatusCompleted } from "../../application/update-status-completed.usecase";
import { parseStatusRecordBody } from "../../infrastructure/messaging/sqs.status.consumer";

export const handler = async (
  event: any
): Promise<APIGatewayProxyResultV2 | void> => {
  if (event?.Records?.[0]?.eventSource === "aws:sqs") {
    return handleStatusSQS(event as SQSEvent);
  }

  const method = event?.requestContext?.http?.method;
  if (method === "GET") return handleGet(event);
  if (method === "POST") return handlePost(event);
  return http(405, { message: "Method Not Allowed" });
};

async function handleGet(event: any): Promise<APIGatewayProxyResultV2> {
  const insuredId = event.pathParameters?.insuredId as string | undefined;
  if (!insuredId) return http(400, { message: "insuredId requerido" });
  const items = await listAppointmentsByInsured(insuredId);
  return http(200, { insuredId, items });
}

async function handlePost(event: any): Promise<APIGatewayProxyResultV2> {
  const body = JSON.parse(event.body ?? "{}");
  const parsed = CreateAppointmentSchema.safeParse(body);
  if (!parsed.success)
    return http(400, {
      message: "Payload inválido",
      issues: parsed.error.issues,
    });

  const { insuredId, scheduleId, countryISO } = parsed.data;
  const appointmentId = uuidv4();
  const createdAt = new Date().toISOString();

  await createAppointment({
    topicArn: env.topicArn,
    input: { appointmentId, createdAt, insuredId, scheduleId, countryISO },
  });

  return http(202, {
    appointmentId,
    status: "pending",
    message: "Agendamiento en proceso",
  });
}

async function handleStatusSQS(event: SQSEvent): Promise<void> {
  for (const r of event.Records) {
    const detail = parseStatusRecordBody(r.body);
    const { appointmentId, createdAt } = detail ?? {};
    if (!appointmentId || !createdAt) continue;
    await updateStatusCompleted(appointmentId, createdAt);
  }
}
