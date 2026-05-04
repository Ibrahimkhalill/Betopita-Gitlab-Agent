import { Router } from "express";
import { db, getConfig, setConfig } from "./db.js";
import { runFullAnalysis } from "./scheduler.js";

const router = Router();

router.get("/projects", (req, res) => {
  const projects = db.prepare(`
    SELECT p.*, a.features, a.unique_features, a.quality_score, a.quality_report, a.analyzed_at
    FROM projects p
    LEFT JOIN (
      SELECT * FROM project_analysis WHERE id IN (SELECT MAX(id) FROM project_analysis GROUP BY project_id)
    ) a ON p.id = a.project_id
  `).all();
  
  res.json(projects.map((p: any) => ({
    ...p,
    features: p.features ? JSON.parse(p.features) : [],
    unique_features: p.unique_features ? JSON.parse(p.unique_features) : []
  })));
});

router.get("/insights", (req, res) => {
  const insights = db.prepare("SELECT * FROM global_insights ORDER BY id DESC LIMIT 1").get() as any;
  if (insights) {
    insights.suggested_products = JSON.parse(insights.suggested_products);
  }
  res.json(insights || null);
});

router.get("/similarities", (req, res) => {
  const similarities = db.prepare("SELECT * FROM project_similarities ORDER BY similarity DESC").all();
  res.json(similarities.map((s: any) => ({
    ...s,
    shared_features: JSON.parse(s.shared_features)
  })));
});

router.get("/logs", (req, res) => {
  const logs = db.prepare("SELECT * FROM scan_logs ORDER BY id DESC LIMIT 20").all();
  res.json(logs);
});

router.post("/scan", async (req, res) => {
  // Run asynchronously
  runFullAnalysis().catch(console.error);
  res.json({ message: "Scan started" });
});

router.get("/config", (req, res) => {
  res.json({
    GITLAB_URL: getConfig("GITLAB_URL") || process.env.GITLAB_URL || "https://gitlab.com",
    GITLAB_GROUP: getConfig("GITLAB_GROUP") || process.env.GITLAB_GROUP || "",
    HAS_TOKEN: !!(getConfig("GITLAB_TOKEN") || process.env.GITLAB_TOKEN),
    HAS_GEMINI_KEY: !!(getConfig("GEMINI_API_KEY") || process.env.GEMINI_API_KEY)
  });
});

router.post("/config", (req, res) => {
  const { GITLAB_URL, GITLAB_TOKEN, GITLAB_GROUP, GEMINI_API_KEY } = req.body;
  
  if (GITLAB_URL) setConfig("GITLAB_URL", GITLAB_URL);
  if (GITLAB_TOKEN) setConfig("GITLAB_TOKEN", GITLAB_TOKEN);
  if (GITLAB_GROUP) setConfig("GITLAB_GROUP", GITLAB_GROUP);
  if (GEMINI_API_KEY) setConfig("GEMINI_API_KEY", GEMINI_API_KEY);
  
  res.json({ message: "Configuration updated" });
});

export default router;
