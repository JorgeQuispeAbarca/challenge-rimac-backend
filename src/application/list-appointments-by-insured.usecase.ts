import { listByInsured } from "../infrastructure/dynamodb/appointments.repository";
import { toListItem } from "../functions/appointment/mapper";

export async function listAppointmentsByInsured(insuredId: string) {
  const items = await listByInsured(insuredId);
  return items.map(toListItem);
}
