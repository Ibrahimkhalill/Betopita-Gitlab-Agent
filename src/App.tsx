/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Config } from './components/Config';
import { Insights } from './components/Insights';
import { LayoutDashboard, Settings, Lightbulb, RefreshCw, Moon, Sun } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const triggerScan = async () => {
    setLoading(true);
    try {
      await fetch('/api/scan', { method: 'POST' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      tabs={[
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'insights', label: 'AI Intelligence', icon: <Lightbulb size={18} /> },
        { id: 'config', label: 'Settings', icon: <Settings size={18} /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isDarkMode={isDarkMode}
      headerRight={
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={triggerScan}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-full font-semibold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20 active:scale-95"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            {loading ? "Analyzing..." : "Analyze Flow"}
          </button>
        </div>
      }
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'insights' && <Insights />}
      {activeTab === 'config' && <Config />}
    </Layout>
  );
}
