import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleAnalyzeSentiment } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "sentiment-agent",
    description: "Analyzes market sentiment from news and stock data, detects divergence signals.",
    url: "http://localhost:3004",
    skills: [
      {
        id: "analyze-sentiment",
        name: "Analyze Sentiment",
        description: "Scores sentiment per symbol, detects divergence between news and price action",
        tags: ["sentiment", "analysis", "market-mood"],
      },
    ],
  },
  taskHandler: handleAnalyzeSentiment,
});

app.route("/", a2a);

startServer(app, 3004, "sentiment-agent");
