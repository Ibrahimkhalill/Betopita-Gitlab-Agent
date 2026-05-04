import { useState, useEffect } from 'react';
import { Lightbulb, Layers, Zap, Package, Sparkles } from 'lucide-react';
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

export function Insights() {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(data => {
        setInsight(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-20 text-center font-mono text-[10px] uppercase tracking-[0.2em] opacity-40 animate-pulse">Running Global Analysis Sequence...</div>;
  
  if (!insight) return (
    <div className="border border-slate-800 p-20 text-center max-w-3xl mx-auto bg-slate-900/10">
      <div className="w-16 h-16 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-10 rotate-45">
        <Lightbulb size={24} className="-rotate-45" />
      </div>
      <h3 className="text-xl font-black text-white mb-4 tracking-tighter uppercase">No Intelligence Data</h3>
      <p className="text-slate-500 font-mono text-xs tracking-wide">Initiate system scan to aggregate repository insights into the global directory.</p>
    </div>
  );

  return (
    <div className="space-y-12">
      {/* Blueprint Header */}
      <div className="border border-slate-800 p-12 relative overflow-hidden bg-slate-950">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Layers size={140} className="text-slate-500" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-start">
          <div className="flex-1 space-y-8">
             <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 font-mono mb-4 tracking-[0.4em]">[ STRATEGIC_OVERVIEW ]</div>
                <h2 className="text-5xl font-black text-white tracking-tighter leading-[0.9] mb-8 uppercase">Neural Graph Analysis</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-slate-900">
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-2 opacity-50">Data Summary</div>
                   <p className="text-slate-400 text-sm leading-relaxed antialiased">{insight.summary}</p>
                </div>
                <div>
                   <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-2 opacity-50">System Recommendation</div>
                   <p className="text-slate-400 text-sm leading-relaxed antialiased italic">
                     Focus on high-overlap repository clusters to maximize code efficiency.
                   </p>
                </div>
             </div>
          </div>
          
          <div className="flex-shrink-0 w-full lg:w-72 border border-slate-800 p-8 bg-slate-900/20">
             <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-6 text-center tracking-widest">Reusability Index</div>
             <div className="text-8xl font-black text-white leading-none text-center tracking-tighter mb-4">
               {insight.reusable_percentage}<span className="text-2xl text-slate-700 ml-1">%</span>
             </div>
             <div className="h-1 bg-slate-900 w-full relative overflow-hidden group">
                <div 
                  className="absolute left-0 top-0 h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${insight.reusable_percentage}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 border-l-4 border-indigo-600 pl-6 py-2">
        <h3 className="text-xs font-black text-white uppercase tracking-[0.5em]">Consolidated Product Vectors</h3>
        <div className="flex-grow h-px bg-slate-900"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-800 border border-slate-800">
        {insight.suggested_products.map((product, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-950 p-10 group hover:bg-indigo-500/[0.02] transition-colors"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono text-slate-600">Vector {String(i + 1).padStart(2, '0')}</div>
              <div className="p-2 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
                <Zap size={14} className="text-indigo-400" />
              </div>
            </div>
            
            <h4 className="text-2xl font-black text-white mb-4 tracking-tighter uppercase group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-8 opacity-80 group-hover:opacity-100 transition-opacity">
              {product.reason}
            </p>
            
            <div className="flex items-center justify-between border-t border-slate-900 pt-6">
              <div className="flex items-center gap-4">
                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono opacity-40">Included Nodes</div>
                 <div className="flex items-center gap-1">
                   {product.repos.map((_, idx) => (
                     <div key={idx} className="w-1.5 h-1.5 bg-slate-700"></div>
                   ))}
                 </div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 font-mono font-black">
                {product.repos.length} Repositories
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
