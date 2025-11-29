

import React, { useState, useEffect } from 'react';
import { GeneratedApp } from '../types';
import { DeployView } from './DeployView';
import { EdgeFunctionViewer } from './EdgeFunctionViewer';
import { Settings, Database, Code2, Globe, Calendar, Layers, Github, Key, CheckCircle, ExternalLink, AlertTriangle, GitBranch, UploadCloud, Zap, DollarSign, CreditCard, Save } from 'lucide-react';
import { getGitHubUser, createRepo, pushFile, GitHubUser } from '../services/githubService';

interface DashboardViewProps {
  app: GeneratedApp;
  onUpdateApp: (updates: Partial<GeneratedApp>) => void;
  onDeploySuccess: (url: string) => void;
  deploymentUrl: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ app, onUpdateApp, onDeploySuccess, deploymentUrl }) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'deploy' | 'github' | 'edge' | 'monetization'>('overview');
  const [nameInput, setNameInput] = useState(app.name);
  
  // GitHub State
  const [ghToken, setGhToken] = useState('');
  const [ghUser, setGhUser] = useState<GitHubUser | null>(null);
  const [repoName, setRepoName] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [ghStatus, setGhStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [ghMsg, setGhMsg] = useState('');

  // RevenueCat State
  const [rcKey, setRcKey] = useState('');
  const [rcSaved, setRcSaved] = useState(false);

  useEffect(() => {
      const savedToken = localStorage.getItem('github_token');
      if (savedToken) {
          setGhToken(savedToken);
          fetchUser(savedToken);
      }
      const savedRc = localStorage.getItem('revenuecat_key');
      if (savedRc) setRcKey(savedRc);
  }, []);

  const fetchUser = async (token: string) => {
      try {
          const user = await getGitHubUser(token);
          setGhUser(user);
      } catch (e) {
          console.error("Invalid GH Token");
      }
  };

  const handleSaveName = () => {
    onUpdateApp({ name: nameInput });
  };

  const handleSaveGhToken = () => {
      localStorage.setItem('github_token', ghToken);
      fetchUser(ghToken);
  };

  const handleSaveRcKey = () => {
    localStorage.setItem('revenuecat_key', rcKey);
    setRcSaved(true);
    setTimeout(() => setRcSaved(false), 2000);
  };

  const handleCreateRepo = async () => {
      if (!ghToken || !ghUser) return;
      setGhStatus('loading');
      try {
          const cleanName = (repoName || app.name).toLowerCase().replace(/[^a-z0-9-]/g, '-');
          let repoUrl = '';
          try {
              const repo = await createRepo(ghToken, cleanName, app.explanation, isPrivate);
              repoUrl = repo.html_url;
          } catch (err: any) {
              if (err.message.includes('name already exists')) {
                  repoUrl = `https://github.com/${ghUser.login}/${cleanName}`;
              } else {
                  throw err;
              }
          }
          await pushFile(ghToken, ghUser.login, cleanName, 'src/App.tsx', app.reactNativeCode, 'Initial commit from MaxiGen');
          setGhStatus('success');
          setGhMsg(`Code pushed to repository: ${repoUrl}`);
      } catch (e: any) {
          setGhStatus('error');
          setGhMsg(e.message);
      }
  };

  return (
    <div className="w-full h-full bg-black/50 flex">
        <div className="w-48 border-r border-zinc-800 bg-zinc-950 p-4 flex flex-col gap-2">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2">Project</div>
            <button 
                onClick={() => setActiveSection('overview')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeSection === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <Layers size={14} /> Overview
            </button>
            <button 
                onClick={() => setActiveSection('deploy')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeSection === 'deploy' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <Globe size={14} /> Deployments
            </button>
            <button 
                onClick={() => setActiveSection('github')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeSection === 'github' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <Github size={14} /> GitHub
            </button>
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-4 px-2">Backend</div>
            <button 
                onClick={() => setActiveSection('edge')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeSection === 'edge' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <Zap size={14} /> Edge Functions
            </button>
            <button 
                onClick={() => setActiveSection('monetization')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${activeSection === 'monetization' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
            >
                <DollarSign size={14} /> Monetization
            </button>
        </div>

        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-black">
            {activeSection === 'overview' && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Project Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1">Project Name</label>
                                <div className="flex gap-2">
                                    <input 
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm font-medium text-white outline-none focus:border-white/20"
                                    />
                                    <button 
                                        onClick={handleSaveName}
                                        disabled={nameInput === app.name}
                                        className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Code2 size={12}/> Platform</div>
                                    <div className="font-semibold text-sm text-white">React (Vite)</div>
                                </div>
                                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                                    <div className="text-xs text-zinc-500 mb-1 flex items-center gap-1"><Calendar size={12}/> Created</div>
                                    <div className="font-semibold text-sm text-white">Just now</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeSection === 'deploy' && <div className="max-w-2xl h-full"><DeployView app={app} onSuccess={onDeploySuccess} /></div>}

            {activeSection === 'github' && (
                <div className="max-w-2xl h-full bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6"><Github size={24} className="text-white" /><h2 className="text-lg font-bold text-white">GitHub Integration</h2></div>
                    {!ghUser ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">PAT</label>
                                <input type="password" value={ghToken} onChange={e => setGhToken(e.target.value)} placeholder="ghp_..." className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white outline-none" />
                            </div>
                            <button onClick={handleSaveGhToken} disabled={!ghToken} className="w-full py-2.5 bg-white text-black rounded-xl text-sm font-bold disabled:opacity-50">Connect GitHub</button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-white">
                                <img src={ghUser.avatar_url} alt={ghUser.login} className="w-10 h-10 rounded-full" />
                                <div><div className="font-bold text-sm">{ghUser.name}</div><div className="text-xs text-zinc-500">@{ghUser.login}</div></div>
                            </div>
                            <div className="space-y-4">
                                <input value={repoName} onChange={e => setRepoName(e.target.value)} placeholder="Repo Name" className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white outline-none" />
                                <button onClick={handleCreateRepo} disabled={ghStatus === 'loading'} className="w-full py-2.5 bg-white text-black rounded-xl text-sm font-bold disabled:opacity-50">{ghStatus === 'loading' ? 'Pushing...' : 'Push to Repository'}</button>
                                {ghMsg && <div className="p-3 bg-zinc-950 text-zinc-300 rounded-lg text-xs border border-zinc-800 break-all">{ghMsg}</div>}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeSection === 'edge' && (
                <div className="h-full bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
                    <EdgeFunctionViewer functions={app.edgeFunctions || []} />
                </div>
            )}

            {activeSection === 'monetization' && (
                <div className="max-w-2xl h-full bg-zinc-900 p-6 rounded-2xl border border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <CreditCard size={24} className="text-pink-500" />
                        <h2 className="text-lg font-bold text-white">RevenueCat Integration</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="p-4 bg-pink-900/20 rounded-xl border border-pink-500/20 text-pink-300 text-sm leading-relaxed">
                            RevenueCat makes it easy to implement in-app subscriptions, analyze customer data, and grow your app's revenue.
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                    <Key size={12} /> Public API Key
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="password"
                                        value={rcKey}
                                        onChange={(e) => setRcKey(e.target.value)}
                                        placeholder="appl_..." 
                                        className="flex-1 p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all" 
                                    />
                                    <button 
                                        onClick={handleSaveRcKey}
                                        className="px-4 bg-white text-black rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                                    >
                                        <Save size={16} /> {rcSaved ? 'Saved' : 'Save'}
                                    </button>
                                </div>
                                <p className="text-[10px] text-zinc-500">Found in RevenueCat Project Settings {'>'} API Keys.</p>
                            </div>
                            
                            <div className="pt-6 border-t border-zinc-800">
                                <h3 className="font-bold text-sm mb-3 text-white">How to add a Paywall</h3>
                                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800">
                                    <ol className="text-sm text-zinc-400 space-y-3 list-decimal pl-4">
                                        <li>Go to the <span className="font-bold text-white">Chat</span> tab.</li>
                                        <li>Type <span className="font-mono text-xs bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800 text-zinc-300">Add a paywall screen using RevenueCat</span>.</li>
                                        <li>The builder will install the SDK, initialize it with your key, and generate the UI.</li>
                                    </ol>
                                </div>
                            </div>
                            
                            <a href="https://app.revenuecat.com/settings/api_keys" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors">
                                Get API Key <ExternalLink size={10} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
