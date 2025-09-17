export type Appointment = {
  appointmentId: string;
  createdAt: string;
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
  status: "pending" | "completed";
};
