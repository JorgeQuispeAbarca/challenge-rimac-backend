import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import type { SQSEvent } from "aws-lambda";

const updateMock = jest.fn(
  async (_id: string, _createdAt: string, _status: "completed") => {}
);

await jest.unstable_mockModule(
  "../application/update-status-completed.usecase.js",
  () => ({
    updateStatusCompleted: updateMock,
  })
);

// Importa el handler HTTP/SQS real (usa parseStatusRecordBody real)
const { handler: appointmentHandler } = await import(
  "../functions/appointment/handler.js"
);

function makeSqsStatusEvent(details: any[]): SQSEvent {
  return {
    Records: details.map((d, i) => ({
      messageId: `m-${i + 1}`,
      receiptHandle: `rh-${i + 1}`,
      body: JSON.stringify({
        version: "0",
        id: `evt-${i + 1}`,
        "detail-type": "AppointmentScheduled",
        source: "app.appointments.worker",
        account: "000000000000",
        time: new Date().toISOString(),
        region: "us-east-1",
        resources: [],
        detail: d,
      }),
      attributes: {} as any,
      messageAttributes: {},
      md5OfBody: "",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:SQS_STATUS",
      awsRegion: "us-east-1",
    })),
  } as any;
}

describe("SQS_STATUS consumer (appointment handler)", () => {
  beforeEach((): void => { updateMock.mockReset(); });


  it("procesa el batch y marca cada cita como completed", async () => {
    const evt = makeSqsStatusEvent([
      {
        appointmentId: "a1",
        createdAt: "2025-01-01T00:00:00Z",
        status: "completed",
      },
      {
        appointmentId: "a2",
        createdAt: "2025-01-02T00:00:00Z",
        status: "completed",
      },
    ]);

    await appointmentHandler(evt as any);

    expect(updateMock).toHaveBeenCalledTimes(2);
    expect(updateMock).toHaveBeenNthCalledWith(1,
      "a1",
      "2025-01-01T00:00:00Z"
    );
    expect(updateMock).toHaveBeenNthCalledWith(2,
      "a2",
      "2025-01-02T00:00:00Z"
    );
  });
});
