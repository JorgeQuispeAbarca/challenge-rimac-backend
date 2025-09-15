// Repositorio RDS (stub). Implementar con mysql2/RDS Proxy cuando se configure.
// Mantiene la firma para que los workers puedan llamarlo.

export async function insertAppointment(_input: {
  appointmentId: string;
  createdAt: string;
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
}) {
  // TODO: ejecutar INSERT idempotente (UNIQUE(appointmentId))
  return;
}
