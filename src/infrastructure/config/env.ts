export const env = {
  get table() {
    return process.env.APPOINTMENTS_TABLE!; // "Appointments"
  },
  get topicArn() {
    return process.env.APPOINTMENTS_TOPIC_ARN!; // ARN SNS
  },
  get eventBus() {
    return process.env.EVENT_BUS_NAME || "default";
  },
};
