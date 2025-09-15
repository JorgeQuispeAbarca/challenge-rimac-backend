export type CreateAppointmentResponse = {
  appointmentId: string;
  status: "pending" | "completed";
  message: string;
};

export type ListAppointmentsResponse = {
  insuredId: string;
  items: Array<{ appointmentId: string; status: string; createdAt: string }>;
};
