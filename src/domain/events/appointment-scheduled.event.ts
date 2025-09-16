export type AppointmentScheduled = {
  appointmentId: string;
  createdAt: string;
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
  status: "completed";
};
