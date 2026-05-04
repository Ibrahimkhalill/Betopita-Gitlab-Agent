import { useState, useEffect } from 'react';
import { Lightbulb, Zap, RefreshCw, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface Insight {
  summary: string;
  reusable_percentage: number;
  suggested_products: Array<{
    name: string;
    reason: string;
    repos: string[];
  }>;
  created_at: string;
}

interface Similarity {
  repo_a: string;
  repo_b: string;
  similarity: number;
  shared_features: string[];
}

export function Insights() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [similarities, setSimilarities] = useState<Similarity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/insights').then(res => res.json()),
      fetch('/api/similarities').then(res => res.json())
    ]).then(([insightData, simData]) => {
      setInsight(insightData);
      setSimilarities(simData);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <RefreshCw className="animate-spin text-indigo-600" size={32} />
      <span className="text-sm font-medium text-slate-500 animate-pulse">Running global logic trace...</span>
    </div>
  );
  
  if (!insight) return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-16 rounded-[2.5rem] text-center max-w-3xl mx-auto shadow-sm">
      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-8">
        <Lightbulb size={40} />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">No Intelligence Data Collected</h3>
      <p className="text-slate-500 dark:text-slate-400 mb-0">Initiate a deep analysis scan to aggregate repository insights and structural connections.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Strategic Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 md:p-16 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Layers size={200} className="text-slate-900 dark:text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 space-y-8">
             <div>
                <span className="px-4 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 inline-block">
                  Strategic Output
                </span>
                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
                  Cross-Repository Intelligence
                </h2>
                <div className="h-1.5 w-24 bg-indigo-600 rounded-full"></div>
             </div>
             
             <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
               {insight.summary}
             </p>
          </div>
          
          <div className="flex-shrink-0 w-full lg:w-72 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] p-8 text-center border border-slate-100 dark:border-slate-700">
             <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Reusability Index</div>
             <div className="text-7xl font-black text-indigo-600 dark:text-indigo-400 leading-none tracking-tighter mb-4">
               {insight.reusable_percentage}%
             </div>
             <div className="h-2 bg-slate-200 dark:bg-slate-700 w-full rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${insight.reusable_percentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-indigo-600" 
                ></motion.div>
             </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Product Opportunities</h3>
           <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {insight.suggested_products.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[2rem] group hover:shadow-xl hover:shadow-indigo-500/5 transition-all"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center transition-colors">
                  <Zap size={24} />
                </div>
                <div className="flex -space-x-3">
                   {product.repos.slice(0, 5).map((_, idx) => (
                     <div key={idx} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm" />
                   ))}
                </div>
              </div>
              
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-indigo-600 transition-colors">
                {product.name}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
                {product.reason}
              </p>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-fit border border-slate-100 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Combines {product.repos.length} Repositories
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white">Overlap Matrix</h3>
           <div className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {similarities.filter(s => s.similarity > 0.1).slice(0, 10).map((sim, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400 leading-none mb-1">{Math.round(sim.similarity * 100)}%</div>
                  <div className="text-[9px] text-slate-400 uppercase font-bold tracking-widest leading-none">Match</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{sim.repo_a}</span>
                  <div className="w-6 h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full"></div>
                  <span className="text-sm font-bold text-slate-800 dark:text-white">{sim.repo_b}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {sim.shared_features.slice(0, 6).map(f => (
                  <span key={f} className="text-[10px] text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-lg uppercase tracking-wider">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
