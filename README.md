# Reto Rímac – Backend (Serverless · TypeScript · Node.js)

API de agendamiento con arquitectura event-driven en AWS (API Gateway + Lambda + DynamoDB + SNS + SQS + EventBridge).
Gestión asíncrona del “agendamiento” y fan-out por país (PE/CL). Documentación OpenAPI servida como endpoint.

## Uso

### ☁️ Deployment

Requisitos: AWS CLI autenticado, permisos para CloudFormation/IAM/SNS/SQS/DynamoDB/EventBridge/Lambda, Node 20 y bun.

```
# instalar dependencias
bun install

# desplegar
bun deploy:dev
```

*⚠️ Nota: Este proyecto ya se encuentra desplegado y listo para su uso* 

[Documentacion](https://xu0ky6js36.execute-api.us-east-1.amazonaws.com/docs)

### ➡️ Flujo end to end

```
1. POST /appointments → guarda en DynamoDB con status=pending y publica en SNS con atributo countryISO.

2. SNS fan-out → entrega a SQS_PE o SQS_CL según el filtro.

3. appointment_pe/appointment_cl consumen la cola y publican AppointmentScheduled (status=completed) en EventBridge.

4. EventBridge (regla) → SQS_STATUS → appointment procesa y actualiza el status en DynamoDB a completed.
```
### 🧪 Testeo

```
# ejecutar pruebas con Jest
bun run test

# ver en modo watch
bun run test:watch

# con cobertura
bun run test:coverage
```

