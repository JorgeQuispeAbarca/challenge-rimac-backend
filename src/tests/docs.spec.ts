import { jest, describe, it, expect } from "@jest/globals";
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { httpEvent } from "./_helpers/aws";

const readFileMock = jest.fn(
  async (_p: string, _enc: string) => "openapi: 3.0.3"
);
const accessMock = jest.fn(async (_p: string, _mode: number) => {});

await jest.unstable_mockModule("node:fs/promises", () => ({
  readFile: readFileMock,
  access: accessMock,
}));
const { handler } = await import("../functions/docs/handler.js");

describe("Docs handler", () => {
  it("GET /docs -> HTML con Swagger UI", async () => {
    const res = (await handler(
      httpEvent({
        rawPath: "/docs",
        requestContext: {
          http: {
            method: "GET",
            path: "/docs",
            protocol: "HTTP/1.1",
            sourceIp: "",
            userAgent: "",
          },
        } as any,
      })
    )) as APIGatewayProxyStructuredResultV2;

    expect(res.statusCode).toBe(200);
    expect(res.headers?.["content-type"]).toMatch(/text\/html/);
    expect(res.body).toContain("SwaggerUIBundle");
  });

  it("GET /openapi.yaml -> sirve YAML", async () => {
    const res = (await handler(
      httpEvent({
        rawPath: "/openapi.yaml",
        requestContext: {
          http: {
            method: "GET",
            path: "/openapi.yaml",
            protocol: "HTTP/1.1",
            sourceIp: "",
            userAgent: "",
          },
        } as any,
      })
    )) as APIGatewayProxyStructuredResultV2;

    expect(res.statusCode).toBe(200);
    expect(res.headers?.["content-type"]).toMatch(/application\/yaml/);
    expect(res.body).toContain("openapi: 3.0.3");
  });
});
