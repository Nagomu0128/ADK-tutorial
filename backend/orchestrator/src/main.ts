import { Hono } from "hono";
import { cors } from "hono/cors";
import { startServer, loadEnv } from "@stock-advisor/shared";
import { authMiddleware } from "./middleware/auth.js";
import { researchRoutes } from "./routes/research.js";
import { watchlistRoutes } from "./routes/watchlist.js";
import { profileRoutes } from "./routes/profile.js";
import { feedbackRoutes } from "./routes/feedback.js";

loadEnv();

const app = new Hono();

app.use("/*", cors());
app.get("/health", (c) => c.json({ status: "ok", service: "orchestrator" }));

// Auth middleware for all /v1 routes
app.use("/v1/*", authMiddleware);

// REST API routes
app.route("/v1/research", researchRoutes);
app.route("/v1/watchlist", watchlistRoutes);
app.route("/v1/profile", profileRoutes);
app.route("/v1/feedback", feedbackRoutes);

startServer(app, 3000, "orchestrator");
