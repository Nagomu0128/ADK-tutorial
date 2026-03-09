import { createMiddleware } from "hono/factory";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { appLogger } from "@stock-advisor/shared";

const logger = appLogger("orchestrator:auth");

// Initialize Firebase Admin (idempotent)
const initFirebase = () => {
  if (getApps().length > 0) return;

  const projectId = process.env["FIREBASE_PROJECT_ID"];

  if (process.env["GOOGLE_APPLICATION_CREDENTIALS"]) {
    // Production: use service account
    initializeApp();
  } else if (projectId) {
    // Cloud Run: uses default credentials
    initializeApp({ projectId });
  } else {
    // Dev: skip Firebase init, use demo auth
    logger.warn("No Firebase config found. Auth will use demo mode.");
  }
};

type AuthUser = {
  readonly uid: string;
  readonly email: string;
};

// Store auth user in Hono context
declare module "hono" {
  interface ContextVariableMap {
    authUser: AuthUser;
  }
}

export const getAuthUser = (c: { get: (key: "authUser") => AuthUser }): AuthUser =>
  c.get("authUser");

export const authMiddleware = createMiddleware(async (c, next) => {
  // Skip auth for health checks
  if (c.req.path === "/health") {
    return next();
  }

  const authHeader = c.req.header("Authorization");

  // Dev mode: no Firebase configured
  if (!process.env["FIREBASE_PROJECT_ID"] && !process.env["GOOGLE_APPLICATION_CREDENTIALS"]) {
    c.set("authUser", { uid: "demo-user", email: "demo@example.com" });
    return next();
  }

  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice(7);

  initFirebase();

  const decodedToken = await getAuth()
    .verifyIdToken(token)
    .catch((err) => {
      logger.error("Token verification failed", { error: err.message });
      return null;
    });

  if (!decodedToken) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("authUser", {
    uid: decodedToken.uid,
    email: decodedToken.email ?? "",
  });

  return next();
});
