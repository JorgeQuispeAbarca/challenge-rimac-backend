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

const { handler: handlerPE } = await import(
  "../functions/appointment_pe/handler.js"
);

describe("Worker PE (SQS_PE)", () => {
  beforeEach((): void => { jest.clearAllMocks(); });

  it("publica en EventBridge y NO inserta RDS si no está configurado", async () => {
    isDbConfiguredMock.mockReturnValue(false);

    const evt = sqsFromSns([
      {
        countryISO: "PE",
        payload: {
          appointmentId: "pe-1",
          insuredId: "12345",
          scheduleId: 1,
          countryISO: "PE",
          createdAt: "2025-01-01T00:00:00Z",
        },
      },
    ]);

    await handlerPE(evt as any);

    expect(emitCompletedMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ appointmentId: "pe-1", status: "completed" })
    );
    expect(insertAppointmentMock).not.toHaveBeenCalled();
  });

  it("si RDS está configurado, inserta y publica EventBridge", async () => {
    isDbConfiguredMock.mockReturnValue(true);

    const payload = {
      appointmentId: "pe-2",
      insuredId: "12345",
      scheduleId: 2,
      countryISO: "PE",
      createdAt: "2025-01-02T00:00:00Z",
    };

    const evt = sqsFromSns([{ countryISO: "PE", payload }]);

    await handlerPE(evt as any);

    expect(insertAppointmentMock).toHaveBeenCalledWith(payload);
    expect(emitCompletedMock).toHaveBeenCalled();
  });
});
