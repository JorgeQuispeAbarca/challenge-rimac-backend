import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  insuredId: z.string().regex(/^\d{5}$/), // EXACTO
  scheduleId: z.number(), // EXACTO
  countryISO: z.enum(["PE", "CL"]), // EXACTO
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
