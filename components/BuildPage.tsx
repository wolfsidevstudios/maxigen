
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Monitor, ArrowUp, Loader2, Play, Plus, Mic, Terminal, Code2, LayoutDashboard, Database, ImageIcon, Hammer, RefreshCw } from 'lucide-react';
import { generateAppCode, editAppCode } from '../services/geminiService';
import { ConsoleViewer } from './ConsoleViewer';
import { DashboardView } from './DashboardView';
import { IntegrationsModal } from './IntegrationsModal';
import { AudioWave } from './AudioWave';
import { speechToText } from '../services/speechService';
import { Integration } from '../services/integrationsService';
import { GeneratedApp, AppState, ChatMessage, ProjectFile } from '../types';

// Sandpack
import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackCodeEditor,
  SandpackConsole,
} from "@codesandbox/sandpack-react";

type Tab = 'preview' | 'code' | 'dashboard';

interface Log {
    type: 'info' | 'warn' | 'error' | 'success' | 'system';
    msg: string;
}

const BuildHome: React.FC<{ onStart: (prompt: string) => void }> = ({ onStart }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    
    const handleMicClick = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setIsListening(true);
            recognitionRef.current = speechToText.start(
                (transcript) => setInput(prev => prev + (prev ? ' ' : '') + transcript),
                () => setIsListening(false)
            );
        }
    };

    const handleBoostUI = () => {
        setInput(prev => prev + (prev ? ' ' : '') + " [BOOST UI: Ultra-modern, 28px radius cards, padded images]");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) onStart(input);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-6 relative">
            <div className="mb-8 p-4 glossy-button rounded-[28px]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
                    <Hammer size={32} className="fill-black text-black" />
                </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 text-center">
                Build Production Web Apps
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed text-center">
                Turn your ideas into full-stack React applications with database, auth, and edge functions.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-[32px] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="shimmer-input-wrapper">
                    <div className="shimmer-input-content relative flex flex-col transition-all group-focus-within:ring-2 ring-white/10">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your web app (e.g. 'SaaS Dashboard with Stripe')..."
                            className="w-full bg-transparent border-none outline-none px-6 py-4 text-xl text-white placeholder:text-zinc-600 font-medium resize-none h-[120px] custom-scrollbar"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        
                         <div className="flex items-center justify-between px-4 pb-2">
                             <div className="flex items-center gap-1">
                                 <button 
                                    type="button"
                                    onClick={handleBoostUI}
                                    className="p-2 rounded-full transition-colors hover:bg-purple-900/30 text-purple-400" 
                                    title="Boost UI"
                                 >
                                    <Rocket size={18} />
                                 </button>
                             </div>
                             <div className="flex items-center gap-3">
                                 <button 
                                    type="button" 
                                    onClick={handleMicClick}
                                    className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}
                                 >
                                     {isListening ? <AudioWave /> : <Mic size={20} />}
                                 </button>
                                 <button 
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="h-10 w-10 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center transition-all shadow-lg shadow-white/10 active:scale-95 disabled:opacity-30 disabled:shadow-none"
                                 >
                                     <ArrowUp size={20} strokeWidth={2.5} />
                                 </button>
                             </div>
                         </div>
                    </div>
                </div>
            </form>
            
            <div className="mt-16 flex flex-wrap justify-center gap-3 opacity-60">
                {["SaaS Dashboard", "E-commerce Admin", "CRM System"].map(suggestion => (
                    <button 
                        key={suggestion}
                        onClick={() => onStart(suggestion)}
                        className="glossy-button px-4 py-2 rounded-full text-sm text-zinc-300 hover:text-white"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    );
};

interface BuildPageProps {
  onProjectCreated?: (app: GeneratedApp) => void;
}

export const BuildPage: React.FC<BuildPageProps> = ({ onProjectCreated }) => {
  const [input, setInput] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [app, setApp] = useState<GeneratedApp | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('preview');
  const [consoleLogs, setConsoleLogs] = useState<Log[]>([]);
  const [deploymentUrl, setDeploymentUrl] = useState('');
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sandpack files state
  const [sandpackFiles, setSandpackFiles] = useState<Record<string, string>>({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert GeneratedApp files to Sandpack format
  useEffect(() => {
    if (app) {
        let files: Record<string, string> = {};
        
        // 1. Process Files from AI
        if (app.files && app.files.length > 0) {
            app.files.forEach((file: ProjectFile) => {
                let path = file.path;
                // Normalize path to remove leading slash if present, Sandpack expects relative or root-relative
                if (path.startsWith('/')) path = path.substring(1);
                files[path] = file.content;
            });
        } else {
            // Fallback for single file or legacy: Place in src/App.tsx
            files = {
                "src/App.tsx": app.webCompatibleCode || app.reactNativeCode,
            };
        }
        
        // 2. Ensure Entry Point (main.tsx) exists
        // Check if any standard entry file is present
        const hasMain = Object.keys(files).some(f => 
            f === 'src/main.tsx' || f === 'src/main.jsx' || f === 'src/index.tsx' || f === 'src/index.jsx'
        );

        if (!hasMain) {
            // Inject default main.tsx
            files['src/main.tsx'] = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
        }

        // 3. Ensure index.css exists (even if empty to prevent import error in main.tsx)
        if (!files['src/index.css']) {
            files['src/index.css'] = `
@tailwind base;
@tailwind components;
@tailwind utilities;
            `;
        }

        // 4. Force index.html to point to src/main.tsx and include Tailwind CDN
        // We overwrite this to ensure the preview works, as the AI might miss the script tag
        files['index.html'] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${app.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

        setSandpackFiles(files);
    }
  }, [app]);

  const handleAddIntegration = (integration: Integration, apiKey?: string, customOption?: string) => {
    let instruction = `\n\n[System: Add Functionality]\nIntegration: ${integration.name}\nDescription: ${integration.description}\nTechnical Context: ${integration.contextPrompt}`;
    if (apiKey) instruction += `\nAPI KEY: ${apiKey}`;
    if (customOption) instruction += `\nConfiguration: ${customOption}`;
    setInput(prev => prev + instruction);
    setShowIntegrationsModal(false);
  };

  const handleMicClick = () => {
    if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
    } else {
        setIsListening(true);
        recognitionRef.current = speechToText.start(
            (transcript) => setInput(prev => prev + (prev ? ' ' : '') + transcript),
            () => setIsListening(false)
        );
    }
  };

  const handleBoostUI = () => {
      setInput(prev => prev + (prev ? ' ' : '') + " [BOOST UI: Ultra-modern, 28px radius cards, padded images]");
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim() || state === AppState.GENERATING) return;

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setState(AppState.GENERATING);
    setConsoleLogs([]); 

    const firebaseConfig = localStorage.getItem('firebase_config') || undefined;
    const revenueCatKey = localStorage.getItem('revenuecat_key') || undefined;

    try {
      if (app) {
          const updatedApp = await editAppCode(app, userMsg.content, undefined, 'gemini-2.5-flash', firebaseConfig, revenueCatKey);
          setApp(updatedApp);
          const aiMsg: ChatMessage = { role: 'assistant', content: `Updated ${updatedApp.name}: ${updatedApp.explanation}`, appData: updatedApp, timestamp: Date.now() };
          setMessages(prev => [...prev, aiMsg]);
      } else {
          // Default to 'web' platform for BuildPage
          const { screens, explanation, edgeFunctions } = await generateAppCode(userMsg.content, 'web', undefined, 'default', undefined, 'gemini-2.5-flash', firebaseConfig, revenueCatKey);
          const newApp = { ...screens[0], edgeFunctions };
          setApp(newApp);
          const aiMsg: ChatMessage = { role: 'assistant', content: explanation, appData: newApp, timestamp: Date.now() };
          setMessages(prev => [...prev, aiMsg]);
          
          if (onProjectCreated) {
              onProjectCreated(newApp);
          }
      }
      setState(AppState.SUCCESS);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'assistant', content: "Sorry, I couldn't build that app. Please try again.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
      setState(AppState.ERROR);
    }
  };

  // SHOW LANDING PAGE IF NO APP
  if (!app && state === AppState.IDLE) {
      return (
          <>
            <BuildHome onStart={handleSubmit} />
            {state === AppState.GENERATING && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-25"></div>
                            <div className="relative w-full h-full bg-zinc-900 rounded-[24px] shadow-xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                                <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full blur-xl opacity-50"></div>
                                <Loader2 size={32} className="text-purple-400 animate-spin relative z-10" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Constructing App</h2>
                        <p className="text-zinc-400 text-sm">Writing React components & configuring backend...</p>
                    </motion.div>
                </div>
            )}
          </>
      );
  }

  // Sandpack specific custom setup
  const sandpackCustomSetup = {
    dependencies: {
        "lucide-react": "latest",
        "framer-motion": "latest",
        "clsx": "latest",
        "tailwind-merge": "latest",
        "firebase": "latest",
        "@revenuecat/purchases-js": "latest",
        "react-router-dom": "latest"
    },
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-black">
      {/* LEFT PANEL */}
      <div className="w-full md:w-[400px] flex flex-col border-r border-zinc-800 h-[40vh] md:h-screen bg-zinc-950 shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20 justify-between">
            <div className="flex items-center gap-2"><div className="p-1.5 bg-white text-black rounded-lg"><Rocket size={16} /></div><h1 className="font-bold text-sm tracking-tight text-white">React Builder</h1></div>
            <div className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 uppercase tracking-wide">Beta</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar pb-32 bg-zinc-950">
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] px-4 py-3 text-[13px] leading-relaxed shadow-sm rounded-2xl ${msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'}`}>{msg.content}</div>
                </div>
            ))}
            {state === AppState.GENERATING && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 bg-zinc-900 rounded-[24px] p-3 border border-zinc-800 shadow-lg flex items-center gap-3 w-fit pr-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900/50 to-blue-500/20 flex items-center justify-center shadow-inner border border-blue-500/20"><Loader2 size={18} className="text-blue-400 animate-spin" /></div>
                    <div className="flex flex-col"><span className="font-bold text-sm text-white">Updating app</span><span className="text-[10px] text-zinc-500 font-medium">Writing React components...</span></div>
                 </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800">
             <div className="shimmer-input-wrapper">
                <div className="shimmer-input-content flex flex-col focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Describe changes..."
                        className="w-full bg-transparent text-sm p-4 min-h-[50px] max-h-[120px] resize-none outline-none text-white placeholder:text-zinc-600 font-medium custom-scrollbar"
                        disabled={state === AppState.GENERATING}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(input); } }}
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1 relative">
                             <div className="relative" ref={plusMenuRef}>
                                <button type="button" onClick={() => setShowPlusMenu(!showPlusMenu)} className={`p-2 rounded-full transition-colors flex items-center gap-2 ${showPlusMenu ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}><Plus size={18} /></button>
                                <AnimatePresence>
                                    {showPlusMenu && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute bottom-full left-0 mb-2 w-48 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800 overflow-hidden z-50 py-1">
                                            <button type="button" onClick={() => { setShowPlusMenu(false); setShowIntegrationsModal(true); }} className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-800 text-zinc-300"><Database size={16} className="text-purple-400" /><span>Integrations</span></button>
                                            <button type="button" onClick={() => { setShowPlusMenu(false); }} className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-800 text-zinc-300"><ImageIcon size={16} className="text-blue-400" /><span>Upload Image</span></button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                             </div>
                             <button 
                                type="button"
                                onClick={handleBoostUI}
                                className="p-2 rounded-full transition-colors hover:bg-purple-900/30 text-purple-400" 
                                title="Boost UI"
                             >
                                <Rocket size={18} />
                             </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleMicClick} className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}>{isListening ? <AudioWave /> : <Mic size={18} />}</button>
                            <button onClick={() => handleSubmit(input)} disabled={!input.trim() || state === AppState.GENERATING} className="h-8 w-8 bg-white hover:bg-zinc-200 rounded-full flex items-center justify-center text-black transition-all shadow-sm active:scale-95 disabled:opacity-30">{state === AppState.GENERATING ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}</button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
        <IntegrationsModal isOpen={showIntegrationsModal} onClose={() => setShowIntegrationsModal(false)} onAdd={handleAddIntegration}/>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-black relative overflow-hidden flex flex-col">
            <div className="flex-1 flex flex-col h-full">
                <div className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3"><div className="text-sm font-bold text-white">{app?.name}</div><div className="h-4 w-px bg-zinc-800" /><div className="flex items-center gap-1 text-xs text-zinc-500"><Monitor size={12} /><span>Web Build</span></div></div>
                        <div className="flex items-center gap-3"><button onClick={() => setActiveTab('dashboard')} className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-zinc-200 transition-all flex items-center gap-2"><Rocket size={12} /> Publish</button></div>
                </div>
                
                <div className="flex-1 relative bg-zinc-900 overflow-hidden">
                    
                    {/* SANDPACK INTEGRATION */}
                    {(activeTab === 'preview' || activeTab === 'code') && (
                        <div className="absolute inset-0 z-10">
                            <SandpackProvider
                                template="vite-react"
                                theme="dark"
                                files={sandpackFiles}
                                style={{ height: '100%' }}
                                options={{
                                    externalResources: ["https://cdn.tailwindcss.com"],
                                    classes: {
                                        "sp-wrapper": "h-full custom-scrollbar",
                                        "sp-layout": "h-full custom-scrollbar",
                                    },
                                }}
                                customSetup={sandpackCustomSetup}
                            >
                                <SandpackLayout style={{ height: '100%' }} className="!h-full border-none rounded-none bg-zinc-900">
                                    {activeTab === 'code' && (
                                        <>
                                            <SandpackFileExplorer className="h-full border-r border-zinc-800 bg-zinc-950" />
                                            <SandpackCodeEditor 
                                                showTabs
                                                showLineNumbers
                                                showInlineErrors
                                                wrapContent
                                                closableTabs
                                                style={{ height: '100%' }}
                                                className="h-full" 
                                            />
                                        </>
                                    )}
                                    {activeTab === 'preview' && (
                                        <SandpackPreview 
                                            showNavigator 
                                            showOpenInCodeSandbox={false}
                                            showRefreshButton
                                            style={{ height: '100%' }}
                                            className="h-full" 
                                        />
                                    )}
                                </SandpackLayout>
                            </SandpackProvider>
                        </div>
                    )}

                    {activeTab === 'dashboard' && app && <DashboardView app={app} onUpdateApp={(updates) => setApp({...app, ...updates})} onDeploySuccess={setDeploymentUrl} deploymentUrl={deploymentUrl} />}
                    
                    {/* Tab Switcher */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl rounded-full p-1.5 flex gap-1 z-30">
                        <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><Play size={12} fill={activeTab === 'preview' ? "currentColor" : "none"} /> Preview</button>
                        <button onClick={() => setActiveTab('code')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><Code2 size={12} /> Code</button>
                        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><LayoutDashboard size={12} /> Dashboard</button>
                    </div>
                </div>
            </div>
      </div>
    </div>
  );
};
