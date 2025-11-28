
import React, { useState, useEffect } from 'react';
import { AIModel } from '../types';
import { Zap, Cpu, Star, CheckCircle2, Flame, Save } from 'lucide-react';

interface SettingsPageProps {
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ currentModel, onModelChange }) => {
  const [firebaseConfig, setFirebaseConfig] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('firebase_config');
      if (saved) setFirebaseConfig(saved);
  }, []);

  const handleSaveFirebase = () => {
      localStorage.setItem('firebase_config', firebaseConfig);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
  };

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

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 shadow-sm overflow-hidden">
           <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
            <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Flame size={18} className="text-orange-500" />
                    Firebase Configuration
                </h2>
                <p className="text-sm text-zinc-400">Paste your firebaseConfig object to enable Auth & DB.</p>
            </div>
            {showSaved && <span className="text-xs font-bold text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Saved</span>}
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