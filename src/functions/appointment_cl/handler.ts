import type { SQSEvent } from "aws-lambda";
import { emitCompleted } from "../../infrastructure/messaging/eventbridge.publisher.js";
import { env } from "../../infrastructure/config/env.js";
import { isDbConfigured } from "../../infrastructure/rds/mysql.client.js";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const snsEnvelope = JSON.parse(record.body);
    const msg =
      typeof snsEnvelope?.Message === "string"
        ? JSON.parse(snsEnvelope.Message)
        : snsEnvelope.Message;

    const { appointmentId, createdAt, insuredId, scheduleId, countryISO } = msg;

    if (isDbConfigured()) {
      const { insertAppointment } = await import(
        "../../infrastructure/rds/appointments.repository.js"
      );
      await insertAppointment({
        appointmentId,
        createdAt,
        insuredId,
        scheduleId,
        countryISO,
      });
      console.log("INSERT OK (CL)", { appointmentId });
    } else {
      console.warn("DB not configured; skipping MySQL insert (CL)", {
        appointmentId,
      });
    }

    await emitCompleted(env.eventBus, {
      appointmentId,
      createdAt,
      insuredId,
      scheduleId,
      countryISO,
      status: "completed",
    });
  }
};
