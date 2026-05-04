import { useState, useEffect } from 'react';
import { Save, Key, Globe, Terminal, Loader2, Settings as SettingsIcon } from 'lucide-react';

export function Config() {
  const [config, setConfig] = useState<any>({
    GITLAB_URL: '',
    GITLAB_TOKEN: '',
    GITLAB_GROUP: '',
    GEMINI_API_KEY: ''
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/config').then(res => res.json()).then(setConfig);
    refreshLogs();
  }, []);

  const refreshLogs = () => {
    fetch('/api/logs').then(res => res.json()).then(setLogs);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      alert(data.message);
    } catch (e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
             <SettingsIcon size={120} />
          </div>

          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
               <SettingsIcon size={24} />
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-900 dark:text-white">Environment Logic</h3>
               <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest uppercase">System Variables</p>
            </div>
          </div>

          <form onSubmit={save} className="space-y-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">GitLab Instance URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={config.GITLAB_URL}
                    onChange={e => setConfig({ ...config, GITLAB_URL: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-slate-200"
                    placeholder="https://gitlab.example.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">GitLab Access Token</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={config.GITLAB_TOKEN}
                    onChange={e => setConfig({ ...config, GITLAB_TOKEN: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-slate-200"
                    placeholder={config.HAS_TOKEN ? "••••••••••••••••" : "glpat-..."}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">Gemini AI API Key</label>
                <div className="relative">
                  <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    value={config.GEMINI_API_KEY}
                    onChange={e => setConfig({ ...config, GEMINI_API_KEY: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all dark:text-slate-200"
                    placeholder={config.HAS_GEMINI_KEY ? "••••••••••••••••" : "AI key..."}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              Save System Configuration
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col h-[600px] shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"></div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Processing Logs</h3>
            </div>
            <button 
              onClick={refreshLogs} 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1.5 rounded-lg"
            >
              Refresh
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-4 custom-scrollbar">
             {logs.map(log => (
               <div key={log.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all">
                 <div className="flex items-center gap-3 mb-2">
                   <div className={cn(
                     "w-2 h-2 rounded-full",
                     log.status === 'completed' ? 'bg-emerald-500' :
                     log.status === 'failed' ? 'bg-rose-500' : 'bg-indigo-500'
                   )} />
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                     {new Date(log.created_at).toLocaleTimeString()}
                   </span>
                 </div>
                 <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                   {log.message}
                 </p>
               </div>
             ))}
             {logs.length === 0 && (
               <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700">
                 <Terminal size={48} className="mb-4 opacity-20" />
                 <p className="font-bold italic">No log entries found.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
