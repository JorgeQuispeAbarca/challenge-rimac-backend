export const env = {
  table: process.env.APPOINTMENTS_TABLE!,          // "Appointments"
  topicArn: process.env.APPOINTMENTS_TOPIC_ARN!,   // ARN SNS
  eventBus: process.env.EVENT_BUS_NAME || "default"
};
