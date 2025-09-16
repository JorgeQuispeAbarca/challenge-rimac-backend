import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
const eb = new EventBridgeClient({});

export async function emitCompleted(eventBus: string, detail: any) {
  await eb.send(new PutEventsCommand({
    Entries: [{
      EventBusName: eventBus,
      Source: "app.appointments.worker",
      DetailType: "AppointmentScheduled",
      Detail: JSON.stringify(detail)
    }]
  }));
}
