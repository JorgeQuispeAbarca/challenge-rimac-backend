import { getPool } from "./mysql.client.js";

export async function insertAppointment(input: {
  appointmentId: string;
  createdAt: string;
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
}) {
  const pool = await getPool();

  const sql = `
    INSERT INTO appointments
      (appointment_id, created_at, insured_id, schedule_id, country_iso)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      insured_id = VALUES(insured_id)`;

  await pool.execute(sql, [
    input.appointmentId,
    new Date(input.createdAt),
    input.insuredId,
    input.scheduleId,
    input.countryISO
  ]);
}
