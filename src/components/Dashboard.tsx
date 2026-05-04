import { useState, useEffect } from 'react';
import { ExternalLink, FileCode, Search, RefreshCw } from 'lucide-react';
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
    p.full_path.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <RefreshCw className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500 animate-pulse">Synchronizing directory...</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Search and Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4 flex-1 max-w-lg">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
            Global Search
          </label>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Filter by name or path..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
        </div>
        
        <div className="flex gap-4">
          <StatMini label="Active Projects" value={projects.length} />
          <StatMini label="Avg Quality" value={`${Math.round(projects.reduce((acc, p) => acc + (p.quality_score || 0), 0) / (projects.filter(p => p.quality_score !== null).length || 1))}%`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={project.id}
            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all flex flex-col"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600 transition-all">
                 <FileCode size={24} />
              </div>
              {project.quality_score !== null && (
                <div className={cn(
                  "px-3 py-1.5 rounded-full text-[11px] font-bold tracking-tight",
                  project.quality_score > 80 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : 
                  project.quality_score > 50 ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : 
                  "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                )}>
                  {project.quality_score}% Quality
                </div>
              )}
            </div>

            <div className="flex-grow space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium truncate mb-4">
                  {project.full_path}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {project.features.slice(0, 3).map(feature => (
                  <span key={feature} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-slate-100 dark:border-slate-800">
                    {feature}
                  </span>
                ))}
                {project.features.length > 3 && (
                  <span className="text-[10px] text-slate-300 font-bold self-center">+{project.features.length - 3}</span>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <a 
                href={project.web_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1.5"
              >
                Go to Repository <ExternalLink size={14} />
              </a>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 shadow-sm" />)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function StatMini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-sm text-center min-w-[140px]">
      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
