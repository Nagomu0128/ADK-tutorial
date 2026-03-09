import pg from "pg";
import { appLogger } from "./logger.js";

const logger = appLogger("db");

const createPool = (): pg.Pool => {
  const isCloudSQL = !!process.env["CLOUD_SQL_CONNECTION_NAME"];

  const pool = new pg.Pool({
    host: isCloudSQL
      ? `/cloudsql/${process.env["CLOUD_SQL_CONNECTION_NAME"]}`
      : (process.env["DB_HOST"] ?? "localhost"),
    port: isCloudSQL ? undefined : parseInt(process.env["DB_PORT"] ?? "5432", 10),
    database: process.env["DB_NAME"] ?? "stock_advisor",
    user: process.env["DB_USER"] ?? "postgres",
    password: process.env["DB_PASSWORD"] ?? "postgres",
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on("error", (err) => {
    logger.error("Unexpected pool error", { error: err.message });
  });

  return pool;
};

// Singleton pool
const poolInstance: pg.Pool | null = null;

export const getPool = (): pg.Pool => {
  if (poolInstance) return poolInstance;
  return createPool();
};

export type QueryResult<T> = {
  readonly rows: readonly T[];
  readonly rowCount: number;
};

export const query = async <T>(
  sql: string,
  params?: readonly unknown[],
): Promise<QueryResult<T>> => {
  const pool = getPool();
  const result = await pool.query(sql, params ? [...params] : undefined);
  return { rows: result.rows as readonly T[], rowCount: result.rowCount ?? 0 };
};
