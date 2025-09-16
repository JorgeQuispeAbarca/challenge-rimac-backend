import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

export function isDbConfigured(): boolean {
  return Boolean(
    process.env.RDS_PROXY_ENDPOINT &&
      process.env.RDS_DB_NAME &&
      process.env.RDS_USER_PARAM &&
      process.env.RDS_PWD_PARAM
  );
}

const ssm = new SSMClient({});

async function getParam(name: string) {
  const out = await ssm.send(
    new GetParameterCommand({ Name: name, WithDecryption: true })
  );
  if (!out.Parameter?.Value) throw new Error(`SSM param not found: ${name}`);
  return out.Parameter.Value;
}

let pool: any | undefined;

async function loadMysql(): Promise<any> {
  const mod = await import("mysql2/promise");
  return (mod as any).default ?? mod;
}

export async function getPool(): Promise<any> {
  if (!isDbConfigured()) {
    throw new Error("RDS not configured (RDS_* env vars missing)");
  }
  if (pool) return pool;

  const [host, database, user, password] = await Promise.all([
    Promise.resolve(process.env.RDS_PROXY_ENDPOINT!),
    Promise.resolve(process.env.RDS_DB_NAME!),
    getParam(process.env.RDS_USER_PARAM!),
    getParam(process.env.RDS_PWD_PARAM!),
  ]);

  const mysql = await loadMysql();
  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 2,
    maxIdle: 2,
    idleTimeout: 60_000,
  });

  return pool;
}
