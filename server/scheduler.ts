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
  const logId = db.prepare('INSERT INTO scan_logs (status, message) VALUES (?, ?)').run('running', 'Deep analysis started').lastInsertRowid;
  
  try {
    const projects = await gitlab.fetchProjects();
    console.log(`📡 Found ${projects.length} projects`);

    const analyzedRepos: any[] = [];

    // 1. Analyze each repo
    for (const project of projects) {
      console.log(`🔍 Deep Analyzing ${project.name}...`);
      
      db.prepare(`
        INSERT OR REPLACE INTO projects (id, name, full_path, web_url, last_analyzed)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `).run(project.id.toString(), project.name, project.path_with_namespace, project.web_url);

      const tree = await gitlab.fetchProjectTree(project.id);
      const importantFiles = tree
        .map(f => f.path)
        .filter(p => {
          const lp = p.toLowerCase();
          return lp.endsWith('package.json') || 
                 lp.endsWith('requirements.txt') || 
                 lp.includes('routes/') || 
                 lp.includes('models/') || 
                 lp.includes('services/') ||
                 lp.endsWith('.ts') || 
                 lp.endsWith('.py') ||
                 lp.endsWith('.js');
        })
        .slice(0, 15);

      const fileContents = await Promise.all(
        importantFiles.map(path => gitlab.fetchFileContent(project.id, path))
      );
      
      const readme = await gitlab.fetchFileContent(project.id, 'README.md');
      const codeSamples = fileContents.join('\n\n---\n\n');
      const treeSummary = tree.map(f => f.path).slice(0, 40).join('\n');

      const analysis = await ai.analyzeProject(project.name, readme, codeSamples, treeSummary);

      if (analysis) {
        analyzedRepos.push({
          id: project.id,
          name: project.name,
          ...analysis
        });
      }
    }

    // 2. Post-processing: Similarity and Unique Features
    console.log('⚖️ Calculating Cross-Repo Matrix...');
    db.prepare('DELETE FROM project_similarities').run();

    for (let i = 0; i < analyzedRepos.length; i++) {
        const repoA = analyzedRepos[i];
        
        // Calculate Uniqueness
        const otherFeatures = analyzedRepos
            .filter(r => r.name !== repoA.name)
            .flatMap(r => r.features);
        
        repoA.unique_features = repoA.features.filter((f: string) => !otherFeatures.includes(f));

        // Save Analysis to DB
        db.prepare(`
          INSERT INTO project_analysis (project_id, features, unique_features, quality_score, quality_report)
          VALUES (?, ?, ?, ?, ?)
        `).run(
          repoA.id.toString(),
          JSON.stringify(repoA.features),
          JSON.stringify(repoA.unique_features),
          repoA.quality_score,
          repoA.quality_report
        );

        // Calculate Similarity with others
        for (let j = i + 1; j < analyzedRepos.length; j++) {
            const repoB = analyzedRepos[j];
            const shared = repoA.features.filter((f: string) => repoB.features.includes(f));
            const union = new Set([...repoA.features, ...repoB.features]);
            const score = union.size === 0 ? 0 : (shared.length / union.size);

            db.prepare(`
              INSERT INTO project_similarities (repo_a, repo_b, similarity, shared_features)
              VALUES (?, ?, ?, ?)
            `).run(repoA.name, repoB.name, score, JSON.stringify(shared));
        }
    }

    // 3. Global Reusability and Insights
    if (analyzedRepos.length > 0) {
      console.log('🧠 Generating Strategic Insights...');
      const allFeatures = analyzedRepos.flatMap(r => r.features);
      const uniqueFeatureSet = new Set(allFeatures);
      const reuseScore = allFeatures.length === 0 ? 0 : Math.round((1 - uniqueFeatureSet.size / allFeatures.length) * 100);

      const globalInsights = await ai.generateGlobalInsights(analyzedRepos);
      if (globalInsights) {
        db.prepare(`
          INSERT INTO global_insights (summary, reusable_percentage, suggested_products)
          VALUES (?, ?, ?)
        `).run(
          globalInsights.summary,
          reuseScore, // Overriding with calculated score based on overlap
          JSON.stringify(globalInsights.suggested_products)
        );
      }
    }

    db.prepare('UPDATE scan_logs SET status = ?, message = ? WHERE id = ?').run('completed', 'Deep analysis sequence completed successfully', logId);
  } catch (err: any) {
    console.error('❌ Analysis failed:', err);
    db.prepare('UPDATE scan_logs SET status = ?, message = ? WHERE id = ?').run('failed', err.message, logId);
  }
}
