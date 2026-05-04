import { useState, useEffect } from 'react';
import { Save, Key, Globe, Terminal, Loader2 } from 'lucide-react';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <form onSubmit={save} className="bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <SettingsIcon size={128} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 rounded flex items-center justify-center text-indigo-400">
               <SettingsIcon />
            </div>
            <div>
               <h3 className="text-lg font-bold text-white tracking-tight">Access Control</h3>
               <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Environment Variables</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">GitLab Endpoint</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input
                    type="text"
                    value={config.GITLAB_URL}
                    onChange={e => setConfig({ ...config, GITLAB_URL: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded text-sm font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">API Authentication Token</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input
                    type="password"
                    value={config.GITLAB_TOKEN}
                    onChange={e => setConfig({ ...config, GITLAB_TOKEN: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded text-sm font-mono text-slate-300 focus:outline-none focus:border-indigo-500/50"
                    placeholder={config.HAS_TOKEN ? "TOKEN_SECURED" : "••••••••••••"}
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Gemini AI Model Key</label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                  <input
                    type="password"
                    value={config.GEMINI_API_KEY}
                    onChange={e => setConfig({ ...config, GEMINI_API_KEY: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded text-sm font-mono text-indigo-400 focus:outline-none focus:border-indigo-500/50"
                    placeholder={config.HAS_GEMINI_KEY ? "GEMINI_SECURED" : "AI_MODEL_KEY"}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs tracking-[0.3em] py-4 rounded transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />}
            Commit Config
          </button>
        </form>
      </div>

      <div className="space-y-6">
        <div className="bg-black/40 border border-slate-800 rounded-lg p-6 flex flex-col h-full font-mono">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Agent Output Terminal</h3>
            </div>
            <button onClick={refreshLogs} className="text-[10px] text-slate-500 hover:text-white transition-colors underline decoration-slate-700">SCRUB_LOGS</button>
          </div>

          <div className="flex-1 space-y-2 text-[11px] overflow-y-auto max-h-[500px] scrollbar-hide">
             {logs.map(log => (
               <div key={log.id} className="group border-l border-slate-800 pl-3 py-1 hover:bg-slate-800/10 transition-colors">
                 <div className="flex items-center gap-2 mb-0.5 opacity-60">
                   <span className={cn(
                     "font-bold",
                     log.status === 'completed' ? 'text-emerald-400' :
                     log.status === 'failed' ? 'text-rose-400' : 'text-indigo-400'
                   )}>
                     [{log.status.toUpperCase()}]
                   </span>
                   <span className="text-slate-600">{new Date(log.created_at).toLocaleTimeString()}</span>
                 </div>
                 <p className="text-slate-400 leading-relaxed">{log.message}</p>
               </div>
             ))}
             {logs.length === 0 && <p className="text-slate-700 italic underline">Empty register...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
