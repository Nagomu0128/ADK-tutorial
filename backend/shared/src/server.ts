import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { appLogger } from "./logger.js";

export const startServer = (
  app: Hono,
  port: number,
  serviceName: string,
): void => {
  const logger = appLogger(serviceName);

  const resolvedPort = parseInt(process.env["PORT"] ?? String(port), 10);
  serve({ fetch: app.fetch, port: resolvedPort }, (info) => {
    logger.info(`${serviceName} running on http://localhost:${info.port}`);
  });
};
