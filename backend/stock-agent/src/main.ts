import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleFetchStockData } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "stock-agent",
    description: "Fetches stock price data and calculates technical indicators for US and JP markets.",
    url: "http://localhost:3003",
    skills: [
      {
        id: "fetch-stock-data",
        name: "Fetch Stock Data",
        description: "Retrieves daily stock prices and computes SMA, RSI, MACD, Bollinger Bands",
        tags: ["stock", "price", "technical-analysis"],
      },
    ],
  },
  taskHandler: handleFetchStockData,
});

app.route("/", a2a);

startServer(app, 3003, "stock-agent");
