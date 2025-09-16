import { jest, describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { httpEvent } from "./_helpers/aws";

const createAppointmentMock = jest.fn(async () => {});

await jest.unstable_mockModule("../application/create-appointment.usecase.js", () => ({
  createAppointment: createAppointmentMock,
}));

const { handler } = await import("../functions/appointment/handler.js");

const OLD_ENV = process.env;

beforeEach(() => {
  process.env = { ...OLD_ENV, APPOINTMENTS_TOPIC_ARN: "arn:aws:sns:local:123:topic" } as any;
  createAppointmentMock.mockClear();
});

afterEach(() => {
  process.env = OLD_ENV;
});

describe("Appointment HTTP handler", () => {
  it("POST /appointment -> 202 Accepted con payload válido", async () => {
    const res: any = await handler(
      httpEvent("POST", "/appointment", {
        insuredId: "12345",
        scheduleId: 9,
        countryISO: "PE",
      }) as any
    );

    expect(res.statusCode).toBe(202);
    const body = JSON.parse(res.body);
    expect(body).toMatchObject({ status: "pending", message: expect.any(String) });
    expect(body.appointmentId).toEqual(expect.any(String));
    expect(createAppointmentMock).toHaveBeenCalledTimes(1);
  });

  it("POST /appointment -> 400 con payload inválido", async () => {
    const res: any = await handler(
      httpEvent("POST", "/appointment", {
        insuredId: "abcde",
        scheduleId: 9,
        countryISO: "PE",
      }) as any
    );

    expect(res.statusCode).toBe(400);
  });
});