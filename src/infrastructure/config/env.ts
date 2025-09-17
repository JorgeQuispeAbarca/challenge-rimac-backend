export const env = {
  get table() {
    return process.env.APPOINTMENTS_TABLE!;
  },
  get topicArn() {
    return process.env.APPOINTMENTS_TOPIC_ARN!;
  },
  get eventBus() {
    return process.env.EVENT_BUS_NAME || "default";
  },
};
