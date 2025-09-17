import { z } from "zod";

export const CreateAppointmentSchema = z.object({
  insuredId: z.string().regex(/^\d{5}$/),
  scheduleId: z.number(),
  countryISO: z.enum(["PE", "CL"]),
});

export type CreateAppointmentInput = z.infer<typeof CreateAppointmentSchema>;
