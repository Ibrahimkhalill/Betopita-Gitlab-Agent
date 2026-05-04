import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { RefreshCw } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  headerRight?: React.ReactNode;
  isDarkMode: boolean;
}

export function Layout({ children, tabs, activeTab, onTabChange, headerRight, isDarkMode }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <RefreshCw size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-slate-800 dark:text-white">GitIntel</h1>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">Autonomous Agent</p>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                  activeTab === tab.id 
                    ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <span className={cn("transition-colors", activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300")}>
                  {tab.icon}
                </span>
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="active-pill" className="ml-auto w-1 h-4 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="mt-auto p-8">
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5">
             <div className="flex items-center gap-2 mb-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Agent Active</span>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
               Monitoring branch activity with periodic scans every 39m.
             </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 px-10 flex items-center justify-between backdrop-blur-md z-10">
          <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {tabs.find(t => t.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            {headerRight}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
