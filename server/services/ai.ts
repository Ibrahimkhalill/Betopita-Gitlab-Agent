import { GoogleGenerativeAI } from "@google/generativeai";
import { getConfig } from "../db.js";

const GENAI_MODEL = "gemini-2.0-flash";

export async function getAiClient() {
  const apiKey = getConfig("GEMINI_API_KEY") || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is missing");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeProject(projectName: string, readme: string, treeSummary: string) {
  const genAI = await getAiClient();
  const model = genAI.getGenerativeModel({ model: GENAI_MODEL });

  const prompt = `
    Analyze the following GitLab project and extract key technical information.
    Project Name: ${projectName}
    
    README Content:
    ${readme.substring(0, 4000)}
    
    Project Structure Summary:
    ${treeSummary}

    Provide the output in valid JSON format with the following structure:
    {
      "features": ["feature1", "feature2"],
      "unique_features": ["unique1"],
      "quality_score": 0-100,
      "quality_report": "Short summary of code quality and architecture",
      "tech_stack": ["React", "Express", etc]
    }
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  // Simple extraction of JSON from markdown results if necessary
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

export async function generateGlobalInsights(projectsData: any[]) {
  const genAI = await getAiClient();
  const model = genAI.getGenerativeModel({ model: GENAI_MODEL });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}
