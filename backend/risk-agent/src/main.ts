import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleAssessRisk } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "risk-agent",
    description: "Evaluates portfolio risk through volatility, sector concentration, and tolerance alignment.",
    url: "http://localhost:3006",
    skills: [
      {
        id: "assess-risk",
        name: "Assess Risk",
        description: "Calculates risk scores, sector concentration, volatility rankings",
        tags: ["risk", "portfolio", "volatility"],
      },
    ],
  },
  taskHandler: handleAssessRisk,
});

app.route("/", a2a);

startServer(app, 3006, "risk-agent");
