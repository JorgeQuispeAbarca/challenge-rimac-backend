// Stub de cliente RDS MySQL (para integrar más adelante con RDS Proxy).
// De momento NO importa mysql2 para no romper el build si no hay RDS.
// Cuando quieras activarlo, instala mysql2 y exporta un pool real.

export type RdsConfig = {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
};

export function getRdsClient(_cfg: RdsConfig) {
  return {
    async query(_sql: string, _params?: any[]) {
      // NO-OP temporal
      return [];
    },
    async end() {}
  };
}
