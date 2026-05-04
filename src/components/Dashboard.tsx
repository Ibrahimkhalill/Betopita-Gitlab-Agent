import { useState, useEffect } from 'react';
import { ExternalLink, CheckCircle2, AlertCircle, FileCode, Search, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface Project {
  id: string;
  name: string;
  full_path: string;
  web_url: string;
  features: string[];
  unique_features: string[];
  quality_score: number | null;
  quality_report: string | null;
  last_analyzed: string | null;
}

export function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.features.some(f => f.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center p-20 text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] italic animate-pulse">
      Initialising repository buffer...
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Top Stats - Geometric Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 border border-slate-800">
        <StatCell title="Repository Count" value={projects.length} subtitle="Detected in Network" />
        <StatCell title="Analysis Node" value={projects.filter(p => p.quality_score !== null).length} subtitle="Successfully Decoded" border />
        <StatCell title="System Integrity" value={Math.round(projects.reduce((acc, p) => acc + (p.quality_score || 0), 0) / (projects.filter(p => p.quality_score !== null).length || 1))} suffix="%" subtitle="Average Quality Score" border />
      </div>

      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div className="relative w-96">
          <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
          <input
            type="text"
            placeholder="FILTER_REPOSITORIES..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 py-2 bg-transparent border-none font-mono text-[11px] uppercase tracking-[0.2em] text-slate-300 focus:outline-none placeholder:text-slate-700"
          />
        </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-4 opacity-40">Displaying {filtered.length} Units</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-800 border border-slate-800">
        {filtered.map((project, i) => (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.02 }}
            key={project.id}
            className="bg-slate-950 p-8 group hover:bg-slate-900 transition-colors flex flex-col min-h-[320px]"
          >
            <div className="flex items-start justify-between mb-8">
              <div className="w-12 h-12 border border-slate-800 flex items-center justify-center text-indigo-500 group-hover:border-indigo-500/50 transition-colors">
                 <FileCode size={20} />
              </div>
              {project.quality_score !== null && (
                <div className={cn(
                  "font-mono font-black text-lg",
                  project.quality_score > 80 ? "text-emerald-500" : project.quality_score > 50 ? "text-amber-500" : "text-rose-500"
                )}>
                  {project.quality_score}%
                </div>
              )}
            </div>

            <div className="flex-grow space-y-4">
              <div>
                <h3 className="text-xl font-black text-white tracking-tighter mb-1 border-l-2 border-transparent group-hover:border-indigo-500 pl-0 group-hover:pl-4 transition-all uppercase">
                  {project.name}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono opacity-50 underline decoration-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">
                  {project.full_path}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                {project.features.slice(0, 4).map(feature => (
                  <span key={feature} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-900 flex items-center justify-between">
              <a 
                href={project.web_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 font-mono hover:text-white transition-colors flex items-center gap-2"
              >
                Launch Repo <ExternalLink size={10} />
              </a>
              <div className="w-2 h-2 rounded-full bg-slate-800"></div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatCell({ title, value, subtitle, suffix = "", border = false }: any) {
  return (
    <div className={cn("p-10 bg-slate-950/50 flex flex-col justify-center", border && "border-l border-slate-800")}>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-4 opacity-60 text-indigo-400">{title}</div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-6xl font-black text-white tracking-tighter">{value}</span>
        {suffix && <span className="text-2xl font-bold text-slate-600">{suffix}</span>}
      </div>
      <p className="text-[10px] text-slate-500 font-mono italic opacity-40">{subtitle}</p>
    </div>
  );
}

function StatCard({ title, value, icon, subtitle, suffix = "" }: any) {
  return (
    <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        <div className="p-2 bg-slate-800 rounded border border-slate-700">{icon}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white">{value}</span>
        {suffix && <span className="text-sm font-bold text-indigo-400">{suffix}</span>}
      </div>
      {subtitle && <p className="text-[10px] text-slate-500 font-mono mt-1">{subtitle}</p>}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
