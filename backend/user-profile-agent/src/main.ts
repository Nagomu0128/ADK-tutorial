import { Hono } from "hono";
import { createA2AServer, startServer } from "@stock-advisor/shared";
import { handleGetUserProfile } from "./handler.js";

const app = new Hono();

const a2a = createA2AServer({
  agentCard: {
    name: "user-profile-agent",
    description: "Manages investor profiles, learns preferences from feedback history.",
    url: "http://localhost:3005",
    skills: [
      {
        id: "get-user-profile",
        name: "Get User Profile",
        description: "Retrieves user profile and generates personalized preference summary",
        tags: ["profile", "personalization", "preferences"],
      },
    ],
  },
  taskHandler: handleGetUserProfile,
});

app.route("/", a2a);

startServer(app, 3005, "user-profile-agent");
