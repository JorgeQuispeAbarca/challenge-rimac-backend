import { updateCompleted } from "../infrastructure/dynamodb/appointments.repository";

export async function updateStatusCompleted(
  appointmentId: string,
  createdAt: string
) {
  await updateCompleted({ appointmentId, createdAt });
}
