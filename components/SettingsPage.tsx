
import React, { useState, useEffect } from 'react';
import { AIModel } from '../types';
import { Zap, Cpu, Star, CheckCircle2, Flame, Save, Key, ExternalLink, LogOut, User as UserIcon, Mail } from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsPageProps {
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
  user: User | null;
  onLogout: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentModel, onModelChange, user, onLogout }) => {
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [showSavedFirebase, setShowSavedFirebase] = useState(false);
  const [showSavedGemini, setShowSavedGemini] = useState(false);

  useEffect(() => {
      const savedFirebase = localStorage.getItem('firebase_config');
      if (savedFirebase) setFirebaseConfig(savedFirebase);

      const savedGemini = localStorage.getItem('gemini_api_key');
      if (savedGemini) setGeminiKey(savedGemini);
  }, []);

  const handleSaveFirebase = () => {
      localStorage.setItem('firebase_config', firebaseConfig);
      setShowSavedFirebase(true);
      setTimeout(() => setShowSavedFirebase(false), 2000);
  };

  const handleSaveGemini = () => {
      localStorage.setItem('gemini_api_key', geminiKey);
      setShowSavedGemini(true);
      setTimeout(() => setShowSavedGemini(false), 2000);
  };

  const getProviderIcon = (providerId: string | undefined) => {
      if (!providerId) return <UserIcon size={20} />;
      if (providerId.includes('github')) {
          return <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>;
      }
      if (providerId.includes('twitter')) {
          return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g></svg>;
      }
      if (providerId.includes('yahoo')) {
          return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" fillRule="evenodd" d="M5 1a4 4 0 0 0 -4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4 -4V5a4 4 0 0 0 -4 -4H5Zm11.727 11h-3.273l3.273 -7.273H20L16.727 12ZM16 14.545a1.818 1.818 0 1 1 -3.636 0 1.818 1.818 0 0 1 3.636 0ZM7.273 8.363H4l3.636 8 -1.454 2.91H9.09l4.727 -10.91H10.91l-1.818 4.364 -1.818 -4.364Z" clipRule="evenodd"></path></svg>;
      }
      if (providerId.includes('google')) {
          return <Zap size={20} />; // Using Zap as placeholder/generic
      }
      return <Mail size={20} />;
  }

  const models: { id: AIModel; name: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      desc: 'Fastest response times. Best for quick prototypes and simple apps.',
      icon: <Zap className="text-yellow-400" size={24} />
    },
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3.0 Pro',
      desc: 'Highest reasoning capability. Best for complex logic and agentic tasks.',
      icon: <Star className="text-purple-400" size={24} />
    },
    {
      id: 'gemini-2.5-pro' as any,
      name: 'Gemini 2.5 Pro',
      desc: 'Balanced performance and reasoning. Good all-rounder.',
      icon: <Cpu className="text-blue-400" size={24} />
    }
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-black custom-scrollbar text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-zinc-400 mb-10">Manage your AI preferences and app configuration.</p>

        {/* Account Section */}
        {user && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <UserIcon size={18} className="text-blue-500" />
                            Account
                        </h2>
                    </div>
                </div>
                <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700">
                             {user.photoURL ? (
                                 <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                     <UserIcon size={24} />
                                 </div>
                             )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-white">{user.displayName || 'MaxiGen User'}</h3>
                                {user.providerData.length > 0 && (
                                    <div className="bg-zinc-800 p-1 rounded-full text-zinc-400" title={`Logged in with ${user.providerData[0].providerId}`}>
                                        {getProviderIcon(user.providerData[0].providerId)}
                                    </div>
                                )}
                            </div>
                            <p className="text-zinc-400 text-sm">{user.email}</p>
                            <p className="text-zinc-600 text-xs mt-1 font-mono">ID: {user.uid.substring(0, 8)}...</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={onLogout}
                        className="glossy-button bg-red-900/20 border-red-900/50 hover:bg-red-900/40 text-red-200 px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-red-900/20"
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>
            </div>
        )}

        {/* AI Key Section - Compact Pill Style */}
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-2">
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Key size={18} className="text-emerald-500" />
                        Gemini API Key
                    </h2>
                    <p className="text-sm text-zinc-400">Required to power the AI features of MaxiGen.</p>
                </div>
                {showSavedGemini && <span className="text-xs font-bold text-green-400 flex items-center gap-1 animate-pulse"><CheckCircle2 size={12}/> Saved</span>}
            </div>

            <div className="shimmer-input-wrapper shadow-2xl">
                 <div className="shimmer-input-content p-2 flex items-center gap-2">
                     <div className="pl-4 pr-2 text-zinc-500">
                        <Key size={16} />
                     </div>
                     <input
                        type="password"
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        placeholder="Paste your Google Gemini API Key here..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 h-10 text-sm font-mono"
                     />
                     <div className="flex items-center gap-2 pr-1">
                         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-zinc-500 hover:text-white transition-colors text-xs font-medium whitespace-nowrap rounded-lg hover:bg-zinc-800">
                             Get Key <ExternalLink size={10} />
                         </a>
                         <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>
                         <button 
                            onClick={handleSaveGemini}
                            className="h-9 px-6 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-sm transition-all shadow-lg shadow-white/10 active:scale-95 whitespace-nowrap"
                         >
                             Save
                         </button>
                     </div>
                 </div>
             </div>
        </div>

        {/* Models Section */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900">
            <h2 className="text-lg font-semibold text-white">AI Model</h2>
            <p className="text-sm text-zinc-400">Select the brain behind MaxiGen.</p>
          </div>
          
          <div className="p-6 grid gap-4">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  currentModel === model.id 
                    ? 'border-white bg-zinc-800' 
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900'
                }`}
              >
                <div className={`p-3 rounded-full bg-zinc-900 shadow-sm border border-zinc-800 shrink-0`}>
                  {model.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">{model.name}</span>
                    {currentModel === model.id && (
                      <span className="px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase rounded-full tracking-wide">Active</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{model.desc}</p>
                </div>
                {currentModel === model.id && (
                  <div className="absolute top-4 right-4 text-white">
                    <CheckCircle2 size={20} className="fill-white text-black" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Firebase Section */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    Firebase Configuration
                </h2>
                <p className="text-sm text-zinc-400">Paste your firebaseConfig object to enable Auth & DB.</p>
            </div>
            {showSavedFirebase && <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Saved</span>}
          </div>
          <div className="p-6">
             <div className="shimmer-input-wrapper">
                 <div className="shimmer-input-content">
                     <textarea
                        value={firebaseConfig}
                        onChange={(e) => setFirebaseConfig(e.target.value)}
                        placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "..."\n};`}
                        className="w-full h-48 p-4 bg-transparent border-none rounded-xl font-mono text-xs outline-none text-zinc-300 resize-none"
                     />
                 </div>
             </div>
             <div className="mt-4 flex justify-end">
                 <button 
                    onClick={handleSaveFirebase}
                    className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
                 >
                     <Save size={16} /> Save Config
                 </button>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
