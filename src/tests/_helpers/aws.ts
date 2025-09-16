import type {
  APIGatewayProxyEventV2,
  APIGatewayEventRequestContextV2,
  SQSEvent,
  SQSRecord,
} from "aws-lambda";

// Mock flexible de HTTP API v2
// Soporta dos firmas:
// - httpEvent("GET" | "POST", path, body?)
// - httpEvent({ rawPath, requestContext?, body? })
export function httpEvent(
  methodOrOpts: "GET" | "POST" | { rawPath?: string; requestContext?: Partial<APIGatewayEventRequestContextV2>; body?: any },
  path?: string,
  payload?: any
): APIGatewayProxyEventV2 {
  const makeCtx = (
    method: "GET" | "POST",
    p: string,
    override?: Partial<APIGatewayEventRequestContextV2>
  ): APIGatewayEventRequestContextV2 => ({
    accountId: "test",
    apiId: "api",
    domainName: "example.com",
    domainPrefix: "example",
    http: { method, path: p, protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "jest" },
    requestId: "req-1",
    routeKey: "$default",
    stage: "$default",
    time: new Date().toISOString(),
    timeEpoch: Date.now(),
    ...(override as any),
    http: { method, path: p, protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "jest", ...(override as any)?.http },
  });

  if (typeof methodOrOpts === "string") {
    const method = methodOrOpts;
    const p = path ?? "/";
    return {
      version: "2.0",
      routeKey: "$default",
      rawPath: p,
      rawQueryString: "",
      headers: { "content-type": "application/json" },
      requestContext: makeCtx(method, p),
      isBase64Encoded: false,
      body: payload != null ? JSON.stringify(payload) : undefined,
      pathParameters: undefined,
      queryStringParameters: undefined,
      stageVariables: undefined,
      cookies: [],
    };
  }

  const rawPath = methodOrOpts.rawPath ?? "/";
  const rc = methodOrOpts.requestContext as Partial<APIGatewayEventRequestContextV2> | undefined;
  const body = methodOrOpts.body;
  return {
    version: "2.0",
    routeKey: "$default",
    rawPath,
    rawQueryString: "",
    headers: { "content-type": "application/json" },
    requestContext: makeCtx((rc?.http as any)?.method ?? "GET", (rc?.http as any)?.path ?? rawPath, rc),
    isBase64Encoded: false,
    body: body != null ? JSON.stringify(body) : undefined,
    pathParameters: undefined,
    queryStringParameters: undefined,
    stageVariables: undefined,
    cookies: [],
  };
}

// Mock de SQS (records cuyo body es un envelope SNS)
// Acepta entradas tipo { Message } o { payload } o un objeto plano (que será el Message)
export function sqsFromSns(messages: Array<{ Message?: any; payload?: any } | any>): SQSEvent {
  const records: SQSRecord[] = messages.map((m, i) => {
    const message = (m && typeof m === "object" && "Message" in m)
      ? (m as any).Message
      : (m && typeof m === "object" && "payload" in m)
        ? (m as any).payload
        : m;

    const envelope = { Message: message };

    return ({
      messageId: `m-${i + 1}`,
      receiptHandle: `rh-${i + 1}`,
      body: JSON.stringify(envelope),
      attributes: {
        ApproximateReceiveCount: "1",
        SentTimestamp: Date.now().toString(),
        SenderId: "test",
        ApproximateFirstReceiveTimestamp: Date.now().toString(),
      } as any,
      messageAttributes: {},
      md5OfBody: "",
      eventSource: "aws:sqs",
      eventSourceARN: "arn:aws:sqs:us-east-1:123456789012:queue",
      awsRegion: "us-east-1",
    }) as any;
  });

  return { Records: records } as SQSEvent;
}
