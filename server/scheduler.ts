import cron from 'node-cron';
import { db } from './db.js';
import * as gitlab from './services/gitlab.js';
import * as ai from './services/ai.js';

export function setupScheduler() {
  // Run every 39 minutes: */39 * * * *
  // Note: 39 is not a factor of 60, so this will run at :00, :39, :18, etc.
  cron.schedule('*/39 * * * *', async () => {
    console.log('⏰ Starting scheduled GitLab Intelligence Scan...');
    await runFullAnalysis();
  });
}

export async function runFullAnalysis() {
  const logId = db.prepare('INSERT INTO scan_logs (status, message) VALUES (?, ?)').run('running', 'Analysis started').lastInsertRowid;
  
  try {
    const projects = await gitlab.fetchProjects();
    console.log(`📡 Found ${projects.length} projects`);

    const analyzedProjects = [];

    for (const project of projects) {
      console.log(`🔍 Analyzing ${project.name}...`);
      
      // Update projects table
      db.prepare(`
        INSERT OR REPLACE INTO projects (id, name, full_path, web_url, last_analyzed)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(project.id.toString(), project.name, project.path_with_namespace, project.web_url);

      // Fetch data samples
      const readme = await gitlab.fetchFileContent(project.id, 'README.md');
      const tree = await gitlab.fetchProjectTree(project.id);
      const treeSummary = tree.map(f => f.path).slice(0, 50).join('\n');

      const analysis = await ai.analyzeProject(project.name, readme, treeSummary);

      if (analysis) {
        db.prepare(`
          INSERT INTO project_analysis (project_id, features, unique_features, quality_score, quality_report)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          project.id.toString(),
          JSON.stringify(analysis.features),
          JSON.stringify(analysis.unique_features),
          analysis.quality_score,
          analysis.quality_report
        );
        
        analyzedProjects.push({
          name: project.name,
          ...analysis
        });
      }
    }

    // Generate Global Insights
    if (analyzedProjects.length > 0) {
      console.log('🧠 Generating Global Insights...');
      const globalInsights = await ai.generateGlobalInsights(analyzedProjects);
      if (globalInsights) {
        db.prepare(`
          INSERT INTO global_insights (summary, reusable_percentage, suggested_products)
          VALUES (?, ?, ?)
        `).run(
          globalInsights.summary,
          globalInsights.overall_reusability_score,
          JSON.stringify(globalInsights.suggested_products)
        );
      }
    }

    db.prepare('UPDATE scan_logs SET status = ?, message = ? WHERE id = ?').run('completed', 'Successfully analyzed all projects', logId);
    console.log('✅ Analysis complete');
  } catch (err: any) {
    console.error('❌ Analysis failed:', err);
    db.prepare('UPDATE scan_logs SET status = ?, message = ? WHERE id = ?').run('failed', err.message, logId);
  }
}
