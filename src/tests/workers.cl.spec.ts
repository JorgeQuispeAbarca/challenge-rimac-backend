import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { sqsFromSns } from "./_helpers/aws";

const emitCompletedMock = jest.fn(async (_bus: string, _detail: any) => {});
const isDbConfiguredMock = jest.fn(() => false);
const insertAppointmentMock = jest.fn(async (_payload: any) => {});

await jest.unstable_mockModule(
  "../infrastructure/messaging/eventbridge.publisher.js",
  () => ({
    emitCompleted: emitCompletedMock,
  })
);
await jest.unstable_mockModule("../infrastructure/rds/mysql.client.js", () => ({
  isDbConfigured: isDbConfiguredMock,
}));
await jest.unstable_mockModule(
  "../infrastructure/rds/appointments.repository.js",
  () => ({
    insertAppointment: insertAppointmentMock,
  })
);

const { handler: handlerCL } = await import(
  "../functions/appointment_cl/handler.js"
);

describe("Worker CL (SQS_CL)", () => {
  beforeEach((): void => { jest.clearAllMocks(); });

  it("publica EventBridge y respeta flag RDS (no inserta si está apagado)", async () => {
    isDbConfiguredMock.mockReturnValue(false);

    const evt = sqsFromSns([
      {
        countryISO: "CL",
        payload: {
          appointmentId: "cl-1",
          insuredId: "12345",
          scheduleId: 9,
          countryISO: "CL",
          createdAt: "2025-01-03T00:00:00Z",
        },
      },
    ]);

    await handlerCL(evt as any);

    expect(emitCompletedMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ appointmentId: "cl-1", status: "completed" })
    );
    expect(insertAppointmentMock).not.toHaveBeenCalled();
  });
});
