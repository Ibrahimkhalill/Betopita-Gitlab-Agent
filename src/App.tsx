/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Config } from './components/Config';
import { Insights } from './components/Insights';
import { LayoutDashboard, Settings, Lightbulb, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);

  const triggerScan = async () => {
    setLoading(true);
    try {
      await fetch('/api/scan', { method: 'POST' });
      alert('Analysis started in background. Check logs in a few minutes.');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout 
      tabs={[
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'insights', label: 'Global Insights', icon: <Lightbulb size={20} /> },
        { id: 'config', label: 'Configuration', icon: <Settings size={20} /> },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerRight={
        <button
          onClick={triggerScan}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Analyze Now
        </button>
      }
    >
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'insights' && <Insights />}
      {activeTab === 'config' && <Config />}
    </Layout>
  );
}
