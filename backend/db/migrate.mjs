import { runner } from "node-pg-migrate";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const isCloudSQL = !!process.env["CLOUD_SQL_CONNECTION_NAME"];

const databaseUrl = `postgres://${process.env["DB_USER"] ?? "postgres"}:${process.env["DB_PASSWORD"] ?? "postgres"}@${process.env["DB_HOST"] ?? "localhost"}:${process.env["DB_PORT"] ?? "5432"}/${process.env["DB_NAME"] ?? "stock_advisor"}`;

const direction = process.argv[2] === "down" ? "down" : "up";

const run = async () => {
  await runner({
    databaseUrl: isCloudSQL
      ? {
          host: `/cloudsql/${process.env["CLOUD_SQL_CONNECTION_NAME"]}`,
          port: 5432,
          database: process.env["DB_NAME"] ?? "stock_advisor",
          user: process.env["DB_USER"] ?? "postgres",
          password: process.env["DB_PASSWORD"] ?? "postgres",
        }
      : databaseUrl,
    migrationsTable: "pgmigrations",
    dir: resolve(__dirname, "migrations"),
    direction,
    log: console.log,
  });

  console.log(`Migration ${direction} completed successfully.`);
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
