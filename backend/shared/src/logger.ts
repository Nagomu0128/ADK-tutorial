type LogLevel = "debug" | "info" | "warn" | "error";

type Logger = {
  readonly debug: (message: string, data?: Record<string, unknown>) => void;
  readonly info: (message: string, data?: Record<string, unknown>) => void;
  readonly warn: (message: string, data?: Record<string, unknown>) => void;
  readonly error: (message: string | { message: string; type?: string; cause?: unknown }, data?: Record<string, unknown>) => void;
};

const formatLog = (level: LogLevel, context: string, message: string, data?: Record<string, unknown>): string => {
  const timestamp = new Date().toISOString();
  const base = JSON.stringify({ timestamp, level, context, message, ...data });
  return base;
};

export const appLogger = (context: string): Logger => ({
  debug: (message, data) => {
    console.debug(formatLog("debug", context, message, data));
  },
  info: (message, data) => {
    console.info(formatLog("info", context, message, data));
  },
  warn: (message, data) => {
    console.warn(formatLog("warn", context, message, data));
  },
  error: (messageOrError, data) => {
    const message = typeof messageOrError === "string"
      ? messageOrError
      : messageOrError.message;
    const extra = typeof messageOrError === "object"
      ? { errorType: messageOrError.type, cause: messageOrError.cause }
      : {};
    console.error(formatLog("error", context, message, { ...extra, ...data }));
  },
});
