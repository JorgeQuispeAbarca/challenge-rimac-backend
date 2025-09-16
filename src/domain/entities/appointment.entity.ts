export type Appointment = {
  appointmentId: string;
  createdAt: string;
  insuredId: string; // EXACTO del PDF
  scheduleId: number; // EXACTO del PDF
  countryISO: "PE" | "CL"; // EXACTO del PDF
  status: "pending" | "completed";
};
