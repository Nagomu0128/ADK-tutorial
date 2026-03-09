import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleResearchNews } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "news-agent",
    description: "Collects financial news from multiple sources, summarizes with Gemini, and scores relevance.",
    url: "http://localhost:3002",
    skills: [
      {
        id: "research-news",
        name: "Research News",
        description: "Fetches news from Finnhub/MarketAux, summarizes and classifies with AI",
        tags: ["news", "finance", "sentiment", "summary"],
      },
    ],
  },
  taskHandler: handleResearchNews,
});

app.route("/", a2a);

startServer(app, 3002, "news-agent");
