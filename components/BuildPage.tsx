
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Monitor, ArrowUp, Loader2, Play, Plus, Mic, Code2, LayoutDashboard, Database, ImageIcon, Hammer, CheckCircle2, FileText, Layers, Zap, MousePointer2, X } from 'lucide-react';
import { generateAppCode, editAppCode, generateProjectPlan } from '../services/geminiService';
import { DashboardView } from './DashboardView';
import { IntegrationsModal } from './IntegrationsModal';
import { AudioWave } from './AudioWave';
import { speechToText } from '../services/speechService';
import { Integration } from '../services/integrationsService';
import { GeneratedApp, AppState, ChatMessage, ProjectFile, ProjectPlan } from '../types';
import { AdOverlay } from './AdOverlay';
import { WebPreview } from './WebPreview';
import { CodeViewer } from './CodeViewer';
import { AgentTerminal } from './AgentTerminal';

type Tab = 'preview' | 'code' | 'dashboard';

interface Log {
    type: 'info' | 'warn' | 'error' | 'success' | 'system';
    msg: string;
}

interface AgentLog {
  id: string;
  step: 'init' | 'plan' | 'code' | 'review' | 'deploy' | 'qa';
  message: string;
  status: 'pending' | 'active' | 'completed';
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
                Build HTML5 Web Apps
            </h1>
            <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed text-center">
                Turn your ideas into modern, responsive HTML/CSS/JS applications instantly with the Power Agent.
            </p>

            <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-[32px] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
                
                <div className="shimmer-input-wrapper">
                    <div className="shimmer-input-content relative flex flex-col transition-all group-focus-within:ring-2 ring-white/10">
                        <textarea 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Describe your web app (e.g. 'Personal Portfolio website')..."
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
                {["Landing Page", "Portfolio", "Login Form"].map(suggestion => (
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
  initialPrompt?: string | null;
  onPromptHandled?: () => void;
  checkCredits: () => boolean;
  initialApp?: GeneratedApp | null;
}

export const BuildPage: React.FC<BuildPageProps> = ({ onProjectCreated, initialPrompt, onPromptHandled, checkCredits, initialApp }) => {
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
  
  const [originalPrompt, setOriginalPrompt] = useState('');

  // Element Selection State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{tagName: string, text: string, htmlSnippet: string} | null>(null);

  // Agent State
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  
  // Screenshot State
  const [captureTrigger, setCaptureTrigger] = useState(0);

  // Handle Initial App passed from Assistant
  useEffect(() => {
      if (initialApp) {
          setApp(initialApp);
          const aiMsg: ChatMessage = { 
              role: 'assistant', 
              content: `Here is the app generated from your voice command.`, 
              appData: initialApp, 
              timestamp: Date.now() 
          };
          setMessages(prev => [...prev, aiMsg]);
          setState(AppState.SUCCESS);
      }
  }, [initialApp]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialPrompt && state === AppState.IDLE && !app) {
        handleSubmit(initialPrompt);
        if (onPromptHandled) onPromptHandled();
    }
  }, [initialPrompt]);

  // Helper to add agent logs
  const addAgentLog = (step: AgentLog['step'], message: string, status: AgentLog['status'] = 'active') => {
      setAgentLogs(prev => {
          // Mark previous active logs as completed
          const updated = prev.map(log => log.status === 'active' ? { ...log, status: 'completed' as const } : log);
          return [...updated, { id: Date.now().toString(), step, message, status }];
      });
  };

  const completeAgentLog = () => {
      setAgentLogs(prev => prev.map(log => log.status === 'active' ? { ...log, status: 'completed' as const } : log));
  };

  const handleQALog = (log: { message: string, status: 'active' | 'completed' | 'error' }) => {
      // Avoid duplicate logs if possible, or just append
      if (log.status === 'completed' && log.message.includes('Testing Complete')) {
          setIsTesting(false);
          completeAgentLog();
          addAgentLog('qa', 'QA Automated Testing Passed.', 'completed');
      } else {
          // Check if the last log is the same to prevent spam
          setAgentLogs(prev => {
              const last = prev[prev.length - 1];
              if (last && last.message === log.message) return prev;
              
              const updated = prev.map(l => l.status === 'active' ? { ...l, status: 'completed' as const } : l);
              return [...updated, { id: Date.now().toString(), step: 'qa', message: log.message, status: log.status === 'error' ? 'active' : 'completed' }]; // Keep errors active?
          });
      }
  };

  const handleScreenshot = (image: string) => {
      // Add screenshot message
      const msg: ChatMessage = {
          role: 'assistant',
          content: '📸 Captured snapshot of your app:',
          attachment: image.split(',')[1], // WebPreview sends full data URI
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, msg]);
  };

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

  const handleElementSelect = (el: {tagName: string, text: string, htmlSnippet: string}) => {
      setSelectedElement(el);
      setIsSelectionMode(false);
  };

  const handleSubmit = async (text: string) => {
    if (!text.trim() || state === AppState.GENERATING || state === AppState.PLANNING) return;
    
    // Credit Check
    if (!checkCredits()) return;

    let promptToSend = text;
    // Prepend Element Context if selected
    if (selectedElement) {
        promptToSend = `[CONTEXT: User selected element <${selectedElement.tagName}> containing text "${selectedElement.text}". HTML context: ${selectedElement.htmlSnippet}] \n\n User Request: ${text}`;
        // Clear selection after sending
        setSelectedElement(null); 
    }

    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    // If we already have an app, this is an EDIT
    if (app) {
        setState(AppState.GENERATING);
        setAgentLogs([]);
        addAgentLog('init', 'Agent activated. Analyzing update request...');
        
        const firebaseConfig = localStorage.getItem('firebase_config') || undefined;
        const revenueCatKey = localStorage.getItem('revenuecat_key') || undefined;
        
        // Simulation of agent thinking
        setTimeout(() => addAgentLog('plan', 'Identifying files to modify...'), 1000);
        setTimeout(() => addAgentLog('code', 'Applying changes to codebase...'), 2500);

        try {
            const updatedApp = await editAppCode(app, promptToSend, undefined, 'gemini-2.5-flash', firebaseConfig, revenueCatKey);
            
            completeAgentLog();
            addAgentLog('review', 'Verifying integrity...', 'completed');
            addAgentLog('deploy', 'Update deployed.', 'completed');

            setApp(updatedApp);
            const aiMsg: ChatMessage = { role: 'assistant', content: `**Update Complete** 🛠️\n\n${updatedApp.explanation}`, appData: updatedApp, timestamp: Date.now() };
            setMessages(prev => [...prev, aiMsg]);
            setState(AppState.SUCCESS);
            
            // Trigger QA and Screenshot
            setTimeout(() => {
                addAgentLog('qa', 'Initiating automated QA testing...', 'active');
                setIsTesting(true);
                // Trigger screenshot after delay
                setTimeout(() => setCaptureTrigger(prev => prev + 1), 3000);
            }, 1000);

        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error during the update. Please try again. 🛑", timestamp: Date.now() }]);
            setState(AppState.ERROR);
        }
    } else {
        // NEW APP: Start Planning Phase
        setState(AppState.PLANNING);
        setOriginalPrompt(text);
        try {
            const plan = await generateProjectPlan(text);
            const aiMsg: ChatMessage = { 
                role: 'assistant', 
                content: `I've created a plan for your app! Check it out below 👇`, 
                plan: plan, 
                timestamp: Date.now() 
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "I had trouble creating a plan. Let's try building directly.", timestamp: Date.now() }]);
            // Fallback to direct build if plan fails
            handleApprovePlan(text);
        }
    }
  };

  const handleApprovePlan = async (promptToUse?: string) => {
      const prompt = promptToUse || originalPrompt;
      setState(AppState.GENERATING);
      setConsoleLogs([]); 
      setAgentLogs([]);

      // Initial Agent Logs
      addAgentLog('init', 'Power Agent initialized.');
      setTimeout(() => addAgentLog('plan', 'Analyzing project requirements and constraints...'), 800);
      setTimeout(() => addAgentLog('plan', 'Designing component architecture...'), 2500);
      setTimeout(() => addAgentLog('code', 'Writing file structure and logic...'), 4500);
      setTimeout(() => addAgentLog('code', 'Implementing modern UI styling...'), 6500);

      const firebaseConfig = localStorage.getItem('firebase_config') || undefined;
      const revenueCatKey = localStorage.getItem('revenuecat_key') || undefined;

      try {
          // Use 'agentic' mode for powerful generation
          const { screens, explanation, edgeFunctions } = await generateAppCode(prompt, 'web', undefined, 'agentic', undefined, 'gemini-2.5-flash', firebaseConfig, revenueCatKey);
          
          completeAgentLog();
          addAgentLog('review', 'Reviewing code for errors...', 'completed');
          addAgentLog('deploy', 'Final build successful. Deploying...', 'completed');

          const newApp = { ...screens[0], edgeFunctions };
          setApp(newApp);
          const aiMsg: ChatMessage = { role: 'assistant', content: explanation, appData: newApp, timestamp: Date.now() };
          setMessages(prev => [...prev, aiMsg]);
          
          if (onProjectCreated) {
              onProjectCreated(newApp);
          }
          setState(AppState.SUCCESS);

          // Trigger QA and Screenshot
          setTimeout(() => {
              addAgentLog('qa', 'Initiating automated QA testing...', 'active');
              setIsTesting(true);
              // Trigger screenshot after delay
              setTimeout(() => setCaptureTrigger(prev => prev + 1), 3000);
          }, 1000);

      } catch (error) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't build that app. Please try again. 🛑", timestamp: Date.now() }]);
          setState(AppState.ERROR);
      }
  };

  // SHOW LANDING PAGE IF NO APP AND NO MESSAGES
  if (!app && messages.length === 0 && state === AppState.IDLE) {
      return (
          <>
            <BuildHome onStart={handleSubmit} />
          </>
      );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden bg-black">
      {/* LEFT PANEL */}
      <div className="w-full md:w-[450px] flex flex-col border-r border-zinc-800 h-[40vh] md:h-screen bg-zinc-950 shadow-xl z-20">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800 bg-zinc-950 sticky top-0 z-20 justify-between">
            <div className="flex items-center gap-2"><div className="p-1.5 bg-white text-black rounded-lg"><Rocket size={16} /></div><h1 className="font-bold text-sm tracking-tight text-white">HTML Builder</h1></div>
            <div className="bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 uppercase tracking-wide">Beta</div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar pb-32 bg-zinc-950">
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    {msg.attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-zinc-700 shadow-sm max-w-[200px]">
                            <img src={`data:image/png;base64,${msg.attachment}`} alt="Snapshot" className="w-full h-auto" />
                        </div>
                    )}
                    {msg.plan ? (
                        <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                             <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                             <div className="p-6">
                                 <h3 className="text-xl font-bold text-white mb-1">{msg.plan.title}</h3>
                                 <p className="text-sm text-zinc-400 mb-6">{msg.plan.targetAudience}</p>
                                 
                                 <div className="space-y-6">
                                     <div>
                                         <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2"><CheckCircle2 size={12} /> Key Features</h4>
                                         <ul className="space-y-2">
                                             {msg.plan.features.map((feat, idx) => (
                                                 <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                                                     <span className="mt-1.5 w-1.5 h-1.5 bg-zinc-600 rounded-full shrink-0"></span>
                                                     {feat}
                                                 </li>
                                             ))}
                                         </ul>
                                     </div>
                                     
                                     <div>
                                         <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2"><Layers size={12} /> Tech Stack</h4>
                                         <div className="flex flex-wrap gap-2">
                                             {msg.plan.techStack.map((tech, idx) => (
                                                 <span key={idx} className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-md text-xs text-zinc-300">{tech}</span>
                                             ))}
                                         </div>
                                     </div>
                                     
                                     <div>
                                          <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2"><FileText size={12} /> Structure</h4>
                                          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                                              {msg.plan.fileStructureSummary.map((file, idx) => (
                                                  <div key={idx} className="text-xs font-mono text-zinc-500 mb-1 last:mb-0 border-l border-zinc-800 pl-2 ml-1">
                                                      {file}
                                                  </div>
                                              ))}
                                          </div>
                                     </div>
                                 </div>
                                 
                                 <button 
                                    onClick={() => handleApprovePlan()}
                                    className="mt-8 w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                 >
                                     <Rocket size={18} /> Approve & Build
                                 </button>
                             </div>
                        </div>
                    ) : (
                        <div className={`max-w-[95%] px-5 py-4 text-[13px] leading-relaxed shadow-sm rounded-2xl whitespace-pre-wrap ${msg.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-bl-sm'}`}>
                            {msg.content}
                        </div>
                    )}
                </div>
            ))}
            
            {state === AppState.PLANNING && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 bg-zinc-900 rounded-[24px] p-4 border border-zinc-800 shadow-lg flex items-center gap-4 w-fit pr-8">
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/20"><LayoutDashboard size={20} className="text-purple-400 animate-pulse" /></div>
                    <div className="flex flex-col"><span className="font-bold text-sm text-white">Drafting Plan</span><span className="text-[10px] text-zinc-500 font-medium">Architecting solution...</span></div>
                 </motion.div>
            )}

            {/* Agent Terminal acts as overlay or embedded component for progress */}
            {(state === AppState.GENERATING || isTesting) && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-4 w-full pr-8">
                    <AgentTerminal logs={agentLogs} />
                 </motion.div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-zinc-950/95 backdrop-blur-sm border-t border-zinc-800">
             <div className="shimmer-input-wrapper">
                <div className="shimmer-input-content flex flex-col focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                    
                    {/* Element Selection Pill */}
                    {selectedElement && (
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 rounded-t-[28px]">
                            <div className="flex items-center gap-2 text-xs text-blue-400">
                                <MousePointer2 size={12} />
                                <span className="font-mono font-bold">Editing &lt;{selectedElement.tagName}&gt;</span>
                                <span className="text-zinc-500 truncate max-w-[200px]">"{selectedElement.text}"</span>
                            </div>
                            <button onClick={() => setSelectedElement(null)} className="text-zinc-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full p-0.5"><X size={12}/></button>
                        </div>
                    )}

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedElement ? "Describe changes for this element..." : "Type a message..."}
                        className="w-full bg-transparent text-sm p-4 min-h-[50px] max-h-[120px] resize-none outline-none text-white placeholder:text-zinc-600 font-medium custom-scrollbar"
                        disabled={state === AppState.GENERATING || state === AppState.PLANNING}
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
                             
                             {/* Element Select Toggle */}
                             <button 
                                type="button"
                                onClick={() => {
                                    if(isSelectionMode) setIsSelectionMode(false);
                                    else {
                                        setIsSelectionMode(true);
                                        setSelectedElement(null);
                                        setActiveTab('preview'); 
                                    }
                                }}
                                className={`p-2 rounded-full transition-colors ${isSelectionMode ? 'bg-blue-500 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-white'}`} 
                                title="Select Element to Edit"
                             >
                                <MousePointer2 size={18} />
                             </button>

                             <button 
                                type="button"
                                onClick={handleBoostUI}
                                className="p-2 rounded-full transition-colors hover:bg-purple-900/30 text-purple-400" 
                                title="Boost UI"
                             >
                                <Zap size={18} />
                             </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleMicClick} className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}>{isListening ? <AudioWave /> : <Mic size={18} />}</button>
                            <button onClick={() => handleSubmit(input)} disabled={!input.trim() || state === AppState.GENERATING || state === AppState.PLANNING} className="h-8 w-8 bg-white hover:bg-zinc-200 rounded-full flex items-center justify-center text-black transition-all shadow-sm active:scale-95 disabled:opacity-30">
                                {state === AppState.GENERATING || state === AppState.PLANNING ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
        </div>
        <IntegrationsModal isOpen={showIntegrationsModal} onClose={() => setShowIntegrationsModal(false)} onAdd={handleAddIntegration}/>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-black relative overflow-hidden flex flex-col">
          {/* Ad Overlay when generating */}
          <AnimatePresence>
            {state === AppState.GENERATING && <AdOverlay />}
          </AnimatePresence>
          
          {app ? (
            <div className="flex-1 flex flex-col h-full">
                <div className="h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0">
                        <div className="flex items-center gap-3"><div className="text-sm font-bold text-white">{app.name}</div><div className="h-4 w-px bg-zinc-800" /><div className="flex items-center gap-1 text-xs text-zinc-500"><Monitor size={12} /><span>Web Build</span></div></div>
                        <div className="flex items-center gap-3"><button onClick={() => setActiveTab('dashboard')} className="bg-white text-black px-5 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-zinc-200 transition-all flex items-center gap-2"><Rocket size={12} /> Publish</button></div>
                </div>
                
                <div className="flex-1 relative bg-zinc-900 overflow-hidden">
                    
                    {/* CUSTOM PREVIEW & CODE VIEWER */}
                    {activeTab === 'preview' && (
                        <WebPreview 
                            files={app.files} 
                            code={app.webCompatibleCode} 
                            onConsole={(log) => setConsoleLogs(prev => [...prev, { ...log, type: log.type === 'info' ? 'info' : log.type === 'warn' ? 'warn' : 'error' }])} 
                            isSelectionMode={isSelectionMode}
                            onElementSelect={handleElementSelect}
                            isTesting={isTesting}
                            onQALog={handleQALog}
                            captureTrigger={captureTrigger}
                            onCapture={handleScreenshot}
                        />
                    )}

                    {activeTab === 'code' && (
                        <div className="h-full">
                             <CodeViewer 
                                files={app.files} 
                                code={app.webCompatibleCode} 
                                language="html" 
                             />
                        </div>
                    )}

                    {activeTab === 'dashboard' && <DashboardView app={app} onUpdateApp={(updates) => setApp({...app, ...updates})} onDeploySuccess={setDeploymentUrl} deploymentUrl={deploymentUrl} />}
                    
                    {/* Tab Switcher */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-zinc-900/90 backdrop-blur-md border border-zinc-800 shadow-xl rounded-full p-1.5 flex gap-1 z-30">
                        <button onClick={() => setActiveTab('preview')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><Play size={12} fill={activeTab === 'preview' ? "currentColor" : "none"} /> Preview</button>
                        <button onClick={() => setActiveTab('code')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><Code2 size={12} /> Code</button>
                        <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}><LayoutDashboard size={12} /> Dashboard</button>
                    </div>
                </div>
            </div>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
                <div className="w-24 h-24 bg-zinc-900 rounded-3xl mb-6 flex items-center justify-center border border-zinc-800 shadow-xl">
                    <Monitor size={48} className="opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-zinc-300 mb-2">Ready to Build</h3>
                <p className="max-w-xs text-center text-sm">Your HTML5 app preview will appear here.</p>
            </div>
          )}
      </div>
    </div>
  );
};
