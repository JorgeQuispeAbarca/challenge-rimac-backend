import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const path = event.rawPath || event.requestContext?.http?.path || "";

  if (path.endsWith("openapi.yml") || path.endsWith("openapi.yaml")) {
    const specPath = resolve(process.cwd(), "docs/openapi.yml");
    const yaml = await readFile(specPath, "utf8");
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/yaml; charset=utf-8",
        "cache-control": "public, max-age=300"
      },
      body: yaml
    };
  }

  const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>Reto Rímac – Appointments (Swagger UI)</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"/>
  <style>body{margin:0}</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      url: "/openapi.yml",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
      layout: "BaseLayout"
    });
  </script>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
    body: html
  };
};
