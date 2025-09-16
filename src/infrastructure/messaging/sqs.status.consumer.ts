export function parseStatusRecordBody(body: string) {
  const envelope = JSON.parse(body);          // EventBridge → SQS
  return typeof envelope?.detail === "string" ? JSON.parse(envelope.detail) : envelope.detail;
}
