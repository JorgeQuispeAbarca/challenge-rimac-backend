import type { SQSEvent } from "aws-lambda";
import { emitCompleted } from "../../infrastructure/messaging/eventbridge.publisher.js";
import { env } from "../../infrastructure/config/env.js";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const snsEnvelope = JSON.parse(record.body);
    const msg =
      typeof snsEnvelope?.Message === "string"
        ? JSON.parse(snsEnvelope.Message)
        : snsEnvelope.Message;

    const { appointmentId, createdAt, insuredId, scheduleId, countryISO } = msg;

    try {
      // TODO: RDS idempotente
      await emitCompleted(env.eventBus, {
        appointmentId,
        createdAt,
        insuredId,
        scheduleId,
        countryISO,
        status: "completed",
      });
    } catch (e) {
      console.error("appointment_cl error:", e);
      throw e;
    }
  }
};
