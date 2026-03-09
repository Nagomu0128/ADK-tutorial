import { appLogger } from "./logger.js";

const logger = appLogger("env");

type EnvConfig = {
  readonly GOOGLE_API_KEY: string;
  readonly ALPHA_VANTAGE_API_KEY: string;
  readonly TWELVE_DATA_API_KEY: string;
  readonly FINNHUB_API_KEY: string;
  readonly MARKETAUX_API_KEY: string;
  readonly DB_HOST: string;
  readonly DB_PORT: string;
  readonly DB_NAME: string;
  readonly DB_USER: string;
  readonly DB_PASSWORD: string;
  readonly FIREBASE_PROJECT_ID: string;
};

const requiredKeys: readonly (keyof EnvConfig)[] = [
  "GOOGLE_API_KEY",
];

const optionalDefaults: Partial<EnvConfig> = {
  DB_HOST: "localhost",
  DB_PORT: "5432",
  DB_NAME: "stock_advisor",
  DB_USER: "postgres",
  DB_PASSWORD: "postgres",
  ALPHA_VANTAGE_API_KEY: "demo",
  TWELVE_DATA_API_KEY: "",
  FINNHUB_API_KEY: "",
  MARKETAUX_API_KEY: "",
  FIREBASE_PROJECT_ID: "",
};

export const loadEnv = (): EnvConfig => {
  const missing = requiredKeys.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.warn(`Missing required env vars: ${missing.join(", ")}. Some features may not work.`);
  }

  const config = Object.fromEntries(
    Object.entries(optionalDefaults).map(([key, defaultValue]) => [
      key,
      process.env[key] ?? defaultValue,
    ]),
  ) as unknown as EnvConfig;

  // Also set required keys
  requiredKeys.forEach((key) => {
    (config as Record<string, string>)[key] = process.env[key] ?? "";
  });

  return config;
};

export const getEnv = (key: string, defaultValue: string = ""): string =>
  process.env[key] ?? defaultValue;
