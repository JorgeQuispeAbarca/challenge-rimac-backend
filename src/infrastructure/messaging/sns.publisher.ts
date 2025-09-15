import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const sns = new SNSClient({});

export async function publishAppointment(topicArn: string, payload: any) {
  await sns.send(new PublishCommand({
    TopicArn: topicArn,
    Message: JSON.stringify(payload),
    MessageAttributes: {
      countryISO: { DataType: "String", StringValue: payload.countryISO }
    }
  }));
}
