import OpenAI from "openai";
import { getConfig } from "../db.js";

const OPENAI_MODEL = "gpt-4o-mini";

async function getAiClient() {
  const apiKey = getConfig("OPENAI_API_KEY") || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please configure it in settings.");
  }
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function analyzeProject(projectName: string, readme: string, codeSamples: string, treeSummary: string) {
  const client = await getAiClient();

  const prompt = `
    Analyze the following GitLab repository in detail.
    Project Name: ${projectName}
    
    README:
    ${readme.substring(0, 3000)}
    
    KEY CODE FILES:
    ${codeSamples.substring(0, 8000)}

    PROJECT STRUCTURE:
    ${treeSummary}

    Perform a technical audit and return ONLY a valid JSON object with the following structure:
    {
      "features": ["Feature A", "Feature B"],
      "unique_features_candidate": ["Unique Logic X"], 
      "tech_stack": ["React", "Python", "PostgreSQL"],
      "architecture": "MVC / Microservices / etc",
      "quality_score": 0-100,
      "quality_report": "Concise technical report on code standard and complexity",
      "integrations": ["Stripe", "AWS S3", "Firebase"]
    }
  `;

  const res = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: "Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content!);
}

export async function generateGlobalInsights(projectsData: any[]) {
  const client = await getAiClient();

  const dataStr = JSON.stringify(projectsData, null, 2);

  const prompt = `
    Analyze the following set of GitLab projects that belong to the same organization.
    Determine what new products can be built by combining these repositories and calculate the reusability percentage.

    Data:
    ${dataStr}

    Return a JSON object:
    {
      "suggested_products": [
        { "name": "Product Name", "reason": "Why combine these?", "repos": ["repo_a", "repo_b"] }
      ],
      "overall_reusability_score": 0-100,
      "common_patterns": ["Shared Auth", "Shared UI components"],
      "summary": "Full strategic overview"
    }
  `;

  const res = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: "Return only valid JSON." },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content!);
}
