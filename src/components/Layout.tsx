import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  headerRight?: React.ReactNode;
}

export function Layout({ children, tabs, activeTab, onTabChange, headerRight }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden p-4 gap-4">
      {/* Sidebar - Geometric Rail */}
      <aside className="w-64 border border-slate-800 bg-slate-950 flex flex-col p-8 overflow-hidden relative">
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#6366f1 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}></div>
        
        <div className="mb-12 relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-2">System Core</div>
          <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
            GITLAB.<span className="text-indigo-500">IA</span>
          </h1>
        </div>
        
        <nav className="space-y-2 flex-grow relative z-10">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 font-mono mb-4 opacity-50 pl-2">Navigation Matrix</div>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-sm text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group",
                activeTab === tab.id 
                  ? "text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/50"
              )}
            >
              <div className={cn(
                "w-1 h-1 rounded-full transition-all",
                activeTab === tab.id ? "bg-indigo-500 scale-150 shadow-[0_0_8px_white]" : "bg-slate-700 opacity-50"
              )}></div>
              {tab.label}
              
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="active-rail" 
                  className="absolute left-[-2px] h-full w-[2px] bg-indigo-500" 
                />
              )}
            </button>
          ))}
        </nav>
        
        <div className="mt-auto pt-8 border-t border-slate-900 relative z-10">
          <div className="bg-slate-900/40 p-4 border border-slate-800 font-mono text-[9px] leading-relaxed text-slate-500">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 bg-emerald-500"></div>
              <span className="text-slate-400 font-bold uppercase tracking-wider">Neural Link Ready</span>
            </div>
            Uptime: 48:12:09<br/>
            Buffer: Stable<br/>
            Scan: Periodic [39m]
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col border border-slate-800 bg-slate-950 overflow-hidden relative">
        <header className="h-20 border-b border-slate-800 px-10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-6">
             <div className="w-10 h-[2px] bg-indigo-600"></div>
             <h2 className="text-xs font-black text-white tracking-[0.4em] uppercase">
               {tabs.find(t => t.id === activeTab)?.label}
             </h2>
          </div>
          <div className="flex items-center gap-6">
            {headerRight}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="p-10"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
