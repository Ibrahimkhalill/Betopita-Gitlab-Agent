import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./server/db.js";
import { setupScheduler } from "./server/scheduler.js";
import apiRoutes from "./server/routes.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.use("/api", apiRoutes);

  // Initialize Scheduler
  setupScheduler();

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🤖 GitLab Intelligence Agent active`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
