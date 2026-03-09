import { serve } from "@hono/node-server";
import type { Hono } from "hono";
import { appLogger } from "./logger.js";

export const startServer = (
  app: Hono,
  port: number,
  serviceName: string,
): void => {
  const logger = appLogger(serviceName);

  serve({ fetch: app.fetch, port }, (info) => {
    logger.info(`${serviceName} running on http://localhost:${info.port}`);
  });
};
