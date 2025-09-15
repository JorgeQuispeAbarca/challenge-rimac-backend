import { publishAppointment } from "../infrastructure/messaging/sns.publisher";
import { putPending } from "../infrastructure/dynamodb/appointments.repository";

export async function createAppointment({
  topicArn,
  input,
}: {
  topicArn: string;
  input: {
    appointmentId: string;
    createdAt: string;
    insuredId: string;
    scheduleId: number;
    countryISO: "PE" | "CL";
  };
}) {
  await putPending({
    ...input,
    status: "pending",
    lastUpdateAt: input.createdAt,
  });
  await publishAppointment(topicArn, input);
}
