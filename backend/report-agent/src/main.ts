import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleGenerateReport } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "report-agent",
    description: "Generates personalized investment reports tailored to user's investment style and experience.",
    url: "http://localhost:3007",
    skills: [
      {
        id: "generate-report",
        name: "Generate Report",
        description: "Creates personalized investment report with buy/hold/skip suggestions",
        tags: ["report", "investment", "personalized"],
      },
    ],
  },
  taskHandler: handleGenerateReport,
});

app.route("/", a2a);

startServer(app, 3007, "report-agent");
