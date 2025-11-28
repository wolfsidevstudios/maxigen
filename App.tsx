
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, ArrowRight, Layout, MousePointer2, ZoomIn, ZoomOut, RotateCcw, Trash2, X, Pencil, Plus, Mic, AudioLines, ArrowUp, Smartphone, Monitor, Layers, PenTool, MousePointer, Square, Image as ImageIcon, Undo2, Redo2, MoreHorizontal, Sparkles, Copy, Bot, Link as LinkIcon, Palette, Globe, Database, Cpu, Settings, Play, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAppCode, editAppCode } from './services/geminiService';
import { speechToText } from './services/speechService';
import { DraggableApp } from './components/DraggableApp';
import { Sidebar } from './components/Sidebar';
import { ProjectsPage } from './components/ProjectsPage';
import { BuildPage } from './components/BuildPage';
import { SettingsPage } from './components/SettingsPage';
import { AnnotationModal } from './components/AnnotationModal';
import { AudioWave } from './components/AudioWave';
import { IntegrationsModal } from './components/IntegrationsModal';
import { MobileSimulator } from './components/MobileSimulator';
import { DeployView } from './components/DeployView';
import { MarketingPage } from './components/MarketingPage';
import { LoginPage } from './components/LoginPage'; // New Import
import { auth } from './services/firebaseConfig'; // Auth Import
import { onAuthStateChanged, User, signOut } from 'firebase/auth'; // Auth Import
import { Integration } from './services/integrationsService';
import { ChatMessage, AppState, CanvasApp, Platform, Page, UserProfile, Project, GenerationMode, ViewMode, AIModel, GeneratedApp } from './types';

// ... (Keep existing LandingPageProps interface and LandingPage component code exactly as is) ...
interface LandingPageProps {
  onSearch: (text: string, image?: string, mode?: GenerationMode, url?: string) => void;
  platform: Platform;
  setPlatform: (p: Platform) => void;
  generationMode: GenerationMode;
  setGenerationMode: (m: GenerationMode) => void;
  onOpenIntegrations: () => void;
  onUploadImage: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSearch, platform, setPlatform, generationMode, setGenerationMode, onOpenIntegrations, onUploadImage }) => {
  const [text, setText] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target as Node)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (text.trim() || attachedImage) {
          onSearch(text, attachedImage || undefined, generationMode, referenceUrl);
      }
  };

  const handleMicClick = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          setIsListening(true);
          recognitionRef.current = speechToText.start(
              (transcript) => setText(prev => prev + (prev ? ' ' : '') + transcript),
              () => setIsListening(false)
          );
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setAttachedImage((ev.target.result as string).split(',')[1]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const getPlaceholder = () => {
      if (generationMode === 'redesign') return "Describe what you want to improve (e.g. 'Make it cleaner')...";
      if (generationMode === 'copy') return "Describe the content of your new app...";
      if (generationMode === 'agentic') return "Research and design a...";
      return "A modern e-commerce dashboard...";
  };

  const getModeColor = () => {
      if (generationMode === 'redesign') return 'bg-purple-950/30 border-purple-500/30 ring-purple-500/20';
      if (generationMode === 'copy') return 'bg-blue-950/30 border-blue-500/30 ring-blue-500/20';
      if (generationMode === 'agentic') return 'bg-teal-950/30 border-teal-500/30 ring-teal-500/20';
      return ''; // Default handled by shimmer wrapper
  };

  return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-6 relative">
          
          <div className="mb-8 p-4 glossy-button rounded-[28px]">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-white/10">
                  <Zap size={32} className="fill-black text-black" />
              </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 text-center">
              What will you build today?
          </h1>
          <p className="text-lg text-zinc-400 mb-10 max-w-lg leading-relaxed text-center">
              Describe your dream app, and MaxiGen will bring it to life in seconds.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-[32px] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity"></div>
              
              <div className="shimmer-input-wrapper">
                  <div className={`shimmer-input-content relative flex flex-col transition-all group-focus-within:ring-2 ring-white/10 ${getModeColor()}`}>
                  
                  {/* Mode Banner */}
                  {generationMode !== 'default' && (
                      <div className="flex items-center justify-between px-6 pt-3 pb-1">
                          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                              generationMode === 'redesign' ? 'text-purple-400' : 
                              generationMode === 'copy' ? 'text-blue-400' : 'text-teal-400'
                          }`}>
                              {generationMode === 'redesign' && <Sparkles size={14} />}
                              {generationMode === 'copy' && <Copy size={14} />}
                              {generationMode === 'agentic' && <Bot size={14} />}
                              {generationMode === 'redesign' ? "Redesign Mode" : generationMode === 'copy' ? "Copy & Design Mode" : "Agentic Mode"}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setGenerationMode('default')}
                            className="text-zinc-500 hover:text-zinc-300"
                          >
                              <X size={14} />
                          </button>
                      </div>
                  )}

                  {/* URL Input for Special Modes */}
                  {(generationMode === 'redesign' || generationMode === 'copy') && (
                      <div className="px-6 py-2 flex items-center gap-2 border-b border-white/5">
                          <LinkIcon size={16} className="text-zinc-500" />
                          <input 
                              value={referenceUrl}
                              onChange={(e) => setReferenceUrl(e.target.value)}
                              placeholder={generationMode === 'redesign' ? "Paste App URL to Redesign (Optional)" : "Paste Style Reference URL (Optional)"}
                              className="flex-1 bg-transparent text-sm outline-none text-zinc-200 placeholder:text-zinc-600"
                          />
                      </div>
                  )}

                  {/* Textarea Area */}
                  <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={getPlaceholder()} 
                      className="w-full bg-transparent border-none outline-none px-6 py-4 text-xl text-white placeholder:text-zinc-600 font-medium resize-none h-[120px] custom-scrollbar"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                      }}
                  />

                  {attachedImage && (
                    <div className="px-6 pb-2">
                        <div className="relative inline-block group/img">
                            <img src={`data:image/png;base64,${attachedImage}`} alt="Reference" className="h-16 w-auto rounded-lg border border-zinc-700 shadow-sm" />
                            <button 
                                type="button"
                                onClick={() => setAttachedImage(null)}
                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity border border-zinc-700"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    </div>
                  )}

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-4 pb-2">
                      <div className="flex items-center gap-1 text-zinc-400 relative">
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileSelect}
                          />
                          
                          {/* PLUS BUTTON MENU */}
                          <div className="relative" ref={plusMenuRef}>
                            <button 
                                type="button" 
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${showPlusMenu ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 hover:text-zinc-300'}`} 
                                title="Add Integration or Image"
                            >
                                <Plus size={20} />
                            </button>
                            
                            <AnimatePresence>
                                {showPlusMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute bottom-full left-0 mb-2 w-48 bg-[#18181b] rounded-xl shadow-xl border border-zinc-800 overflow-hidden z-50 py-1"
                                    >
                                        <button 
                                            type="button"
                                            onClick={() => { setShowPlusMenu(false); onOpenIntegrations(); }}
                                            className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-800 text-zinc-300"
                                        >
                                            <Database size={16} className="text-purple-400" />
                                            <span>Integrations</span>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => { setShowPlusMenu(false); fileInputRef.current?.click(); }}
                                            className="w-full text-left px-4 py-3 flex items-center gap-2 text-sm hover:bg-zinc-800 text-zinc-300"
                                        >
                                            <ImageIcon size={16} className="text-blue-400" />
                                            <span>Upload Image</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                          </div>
                          
                          <div className="w-px h-5 bg-zinc-800 mx-2"></div>
                          
                          {/* Platform Toggle (Integrated) */}
                          <div className="flex bg-zinc-900 rounded-full p-0.5 border border-zinc-800">
                              <button 
                                  type="button"
                                  onClick={() => setPlatform('mobile')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${platform === 'mobile' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                  <Smartphone size={14} />
                                  <span>Mobile</span>
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => setPlatform('web')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${platform === 'web' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                              >
                                  <Monitor size={14} />
                                  <span>Web</span>
                              </button>
                          </div>
                      </div>

                      <div className="flex items-center gap-3">
                          <button 
                            type="button" 
                            onClick={handleMicClick}
                            className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'}`}
                          >
                              {isListening ? <AudioWave /> : <Mic size={20} />}
                          </button>

                          {/* 3 Dots Menu */}
                          <div className="relative" ref={menuRef}>
                              <button 
                                type="button" 
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p-2 rounded-full text-zinc-400 hover:text-zinc-300 transition-colors ${showMenu ? 'bg-zinc-800 text-zinc-300' : 'hover:bg-zinc-800'}`}
                              >
                                <MoreHorizontal size={20} />
                              </button>
                              
                              <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute bottom-full right-0 mb-2 w-48 bg-[#18181b] rounded-xl shadow-xl border border-zinc-800 overflow-hidden z-50 py-1"
                                    >
                                        <div className="px-3 py-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Beta Tools</div>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowMenu(false); setGenerationMode('redesign'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'redesign' ? 'bg-purple-900/20 text-purple-400' : 'hover:bg-zinc-800 text-zinc-300'}`}
                                        >
                                            <Sparkles size={14} />
                                            Redesign Mode
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowMenu(false); setGenerationMode('copy'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'copy' ? 'bg-blue-900/20 text-blue-400' : 'hover:bg-zinc-800 text-zinc-300'}`}
                                        >
                                            <Copy size={14} />
                                            Copy & Design
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowMenu(false); setGenerationMode('agentic'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'agentic' ? 'bg-teal-900/20 text-teal-400' : 'hover:bg-zinc-800 text-zinc-300'}`}
                                        >
                                            <Bot size={14} />
                                            Agentic Mode
                                        </button>
                                    </motion.div>
                                )}
                              </AnimatePresence>
                          </div>

                          <button 
                              type="submit"
                              disabled={!text.trim() && !attachedImage}
                              className="h-10 w-10 bg-white hover:bg-zinc-200 text-black rounded-full flex items-center justify-center transition-all shadow-lg shadow-white/10 active:scale-95 disabled:opacity-30 disabled:shadow-none"
                          >
                              <ArrowUp size={20} strokeWidth={2.5} />
                          </button>
                      </div>
                  </div>
              </div>
              </div>
          </form>

          {/* Quick Starters */}
          <div className="mt-16 flex flex-wrap justify-center gap-3 opacity-60">
              {[
                  "Crypto Wallet", 
                  "Recipe Finder", 
                  "Task Manager", 
                  "Meditation App"
              ].map(suggestion => (
                  <button 
                      key={suggestion}
                      onClick={() => onSearch(suggestion)}
                      className="glossy-button px-4 py-2 rounded-full text-sm text-zinc-300 hover:text-white"
                  >
                      {suggestion}
                  </button>
              ))}
          </div>
      </div>
  );
};

// Define View States
type ViewState = 'marketing' | 'login' | 'app';

export default function App() {
  // Navigation & User State
  const [viewState, setViewState] = useState<ViewState>('marketing');
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [activePage, setActivePage] = useState<Page>('home');
  const [userProfile, setUserProfile] = useState<UserProfile>({
      name: "Designer",
      handle: "@designer_ai",
      bio: "Building the future with MaxiGen.",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
  });
  const [projects, setProjects] = useState<Project[]>([]);

  // Core App State
  const [input, setInput] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [canvasApps, setCanvasApps] = useState<CanvasApp[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  
  // Platform & Mode State
  const [platform, setPlatform] = useState<Platform>('mobile');
  const [generationMode, setGenerationMode] = useState<GenerationMode>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('design');
  
  // AI Configuration
  const [aiModel, setAiModel] = useState<AIModel>('gemini-2.5-flash');

  // Annotation State
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  
  // Integrations State
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  
  // Speech State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [topZIndex, setTopZIndex] = useState(10);
  
  // Panning State
  const isDragging = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AUTH LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoadingAuth(false);
        if (currentUser) {
            // User logged in
            setUserProfile(prev => ({
                ...prev,
                name: currentUser.displayName || 'Designer',
                avatarUrl: currentUser.photoURL || prev.avatarUrl,
                handle: currentUser.email ? `@${currentUser.email.split('@')[0]}` : prev.handle
            }));
            if (viewState === 'login') {
                setViewState('app');
            }
        }
    });
    return () => unsubscribe();
  }, [viewState]);

  const handleLogout = async () => {
    try {
        await signOut(auth);
        setUser(null);
        setViewState('marketing'); // Go back to marketing page on logout
        setActivePage('home');
    } catch (error) {
        console.error("Logout error", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync projects with canvasApps creation
  useEffect(() => {
    setProjects(currentProjects => {
        const existingIds = new Set(currentProjects.map(p => p.id));
        const newApps = canvasApps.filter(app => !existingIds.has(app.id));
        
        if (newApps.length === 0) return currentProjects;

        const newProjects = newApps.map(app => ({
            id: app.id,
            name: app.data.name,
            platform: app.data.platform,
            lastEdited: 'Just now',
            icon: app.data.icon 
        }));
        return [...currentProjects, ...newProjects];
    });
  }, [canvasApps]);

  // Handler for Build Page generated apps
  const handleBuildProjectCreated = (appData: GeneratedApp) => {
      setProjects(prev => [{
          id: crypto.randomUUID(),
          name: appData.name,
          platform: appData.platform,
          lastEdited: 'Just now',
          icon: appData.icon
      }, ...prev]);
  };

  // Auto-select app when switching to Prototype mode
  useEffect(() => {
      if ((viewMode === 'prototype' || viewMode === 'deploy') && !selectedAppId && canvasApps.length > 0) {
          setSelectedAppId(canvasApps[0].id);
      }
  }, [viewMode, canvasApps]);

  const handleNewProject = () => {
      setMessages([]);
      setCanvasApps([]);
      setSelectedAppId(null);
      setState(AppState.IDLE);
      setZoom(1);
      setPan({x: 0, y: 0});
      setActivePage('home');
      setViewMode('design');
  };

  const handleAddIntegration = (integration: Integration, apiKey?: string, customOption?: string) => {
      let instruction = `\n\n[System: Add Functionality]\nIntegration: ${integration.name}\nDescription: ${integration.description}\nTechnical Context: ${integration.contextPrompt}`;
      if (apiKey) {
          instruction += `\nAPI KEY: ${apiKey} (Use this key securely in the code)`;
      }
      if (customOption) {
          instruction += `\nConfiguration: Selected Model = ${customOption}`;
      }
      setInput(prev => prev + instruction);
      setShowIntegrationsModal(false);
  };

  const processInput = async (text: string, image?: string, mode?: GenerationMode, url?: string) => {
    if ((!text.trim() && !image) || state === AppState.GENERATING) return;

    const usedMode = mode || generationMode;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text || (usedMode === 'redesign' ? 'Redesign this app' : 'Generate app'),
      timestamp: Date.now(),
      attachment: image || pendingAttachment || undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setPendingAttachment(null);
    setState(AppState.GENERATING);

    if (!selectedAppId) {
        setGenerationMode('default');
    }

    const firebaseConfig = localStorage.getItem('firebase_config') || undefined;
    const revenueCatKey = localStorage.getItem('revenuecat_key') || undefined;

    try {
      if (selectedAppId) {
        const appToEdit = canvasApps.find(app => app.id === selectedAppId);
        if (!appToEdit) throw new Error("Selected app not found");

        const result = await editAppCode(appToEdit.data, text, userMessage.attachment, aiModel, firebaseConfig, revenueCatKey);

        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: `Updated ${result.name}: ${result.explanation}`,
          appData: result,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        
        setCanvasApps(prev => prev.map(app => 
            app.id === selectedAppId ? { ...app, data: result } : app
        ));

        setState(AppState.SUCCESS);

      } else {
        const { screens, explanation, sources, suggestedIntegrations } = await generateAppCode(text, platform, userMessage.attachment, usedMode, url, aiModel, firebaseConfig, revenueCatKey);
        
        let startX = 100;
        let startY = 100;

        if (canvasApps.length > 0) {
            const rightMostApp = canvasApps.reduce((prev, current) => (prev.x > current.x) ? prev : current);
            const gap = rightMostApp.data.platform === 'web' ? 980 : 350; 
            startX = rightMostApp.x + gap;
            startY = rightMostApp.y;
        }

        const newApps: CanvasApp[] = screens.map((screenData, index) => {
            const width = screenData.platform === 'web' ? 960 : 320;
            return {
                id: crypto.randomUUID(),
                data: screenData,
                x: startX + (index * (width + 40)), 
                y: startY,
                zIndex: topZIndex + index + 1
            };
        });

        const countText = screens.length > 1 ? `\n\n(Generated ${screens.length} screens)` : '';
        
        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: explanation + countText,
          timestamp: Date.now(),
          appData: { ...screens[0], name: `${screens.length} Screens` },
          sources: sources,
          suggestedIntegrations: suggestedIntegrations
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setState(AppState.SUCCESS);
        
        setCanvasApps(prev => [...prev, ...newApps]);
        setTopZIndex(prev => prev + newApps.length);
        
        if (newApps.length > 0) {
            setSelectedAppId(newApps[0].id);
        }
      }

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setState(AppState.ERROR);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processInput(input);
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

  const updateAppPosition = (id: string, pos: { x: number, y: number }) => {
    setCanvasApps(prev => prev.map(app => 
        app.id === id ? { ...app, x: pos.x, y: pos.y } : app
    ));
  };

  const removeApp = (id: string) => {
    setCanvasApps(prev => prev.filter(app => app.id !== id));
    if (selectedAppId === id) setSelectedAppId(null);
  };

  const focusApp = (id: string) => {
    setCanvasApps(prev => prev.map(app => 
        app.id === id ? { ...app, zIndex: topZIndex + 1 } : app
    ));
    setTopZIndex(prev => prev + 1);
  };

  const handleClearCanvas = () => {
    if (confirm("Clear all screens from the canvas?")) {
        setCanvasApps([]);
        setSelectedAppId(null);
        setTopZIndex(10);
    }
  };

  const handleAnnotationCapture = (base64: string) => {
    setPendingAttachment(base64);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget && viewMode === 'design') {
        isDragging.current = true;
        lastPointerPosition.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
        setSelectedAppId(null); 
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current && viewMode === 'design') {
        const deltaX = e.clientX - lastPointerPosition.current.x;
        const deltaY = e.clientY - lastPointerPosition.current.y;
        
        setPan(prev => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY
        }));
        
        lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging.current) {
        isDragging.current = false;
        e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  // --- ROUTING LOGIC ---

  if (loadingAuth) {
    return <div className="h-screen w-full bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
  }

  // 1. Marketing Page (Public)
  if (viewState === 'marketing') {
      return <MarketingPage onGetStarted={() => setViewState(user ? 'app' : 'login')} />;
  }

  // 2. Login Page
  if (viewState === 'login' && !user) {
      return <LoginPage onLoginSuccess={() => setViewState('app')} />;
  }

  // 3. Main App (Private)
  if (messages.length === 0 && canvasApps.length === 0 && activePage === 'home') {
      return (
        <div className="flex h-screen w-full bg-black font-sans selection:bg-white selection:text-black overflow-hidden">
            <Sidebar activePage={activePage} onNavigate={setActivePage} recentProjects={projects} onNewProject={handleNewProject} />
            <div className="flex-1 relative overflow-hidden bg-black">
                <LandingPage 
                    onSearch={processInput} 
                    platform={platform} 
                    setPlatform={setPlatform} 
                    generationMode={generationMode}
                    setGenerationMode={setGenerationMode}
                    onOpenIntegrations={() => setShowIntegrationsModal(true)}
                    onUploadImage={() => {}}
                />
            </div>
            
            <IntegrationsModal 
                isOpen={showIntegrationsModal} 
                onClose={() => setShowIntegrationsModal(false)}
                onAdd={handleAddIntegration}
            />
        </div>
      );
  }

  return (
    <div className="h-screen bg-black text-white flex overflow-hidden font-sans selection:bg-white selection:text-black">
      
      <Sidebar activePage={activePage} onNavigate={setActivePage} recentProjects={projects} onNewProject={handleNewProject} />
      
      <AnnotationModal 
        isOpen={showAnnotationModal}
        onClose={() => setShowAnnotationModal(false)}
        apps={canvasApps}
        onCapture={handleAnnotationCapture}
      />
      
      <IntegrationsModal 
         isOpen={showIntegrationsModal} 
         onClose={() => setShowIntegrationsModal(false)}
         onAdd={handleAddIntegration}
      />

      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {activePage === 'projects' && (
            <ProjectsPage profile={userProfile} projects={projects} onUpdateProfile={setUserProfile} />
        )}
        
        {activePage === 'settings' && (
            <SettingsPage 
                currentModel={aiModel} 
                onModelChange={setAiModel} 
                user={user} 
                onLogout={handleLogout} 
            />
        )}

        {activePage === 'build' && (
            <BuildPage onProjectCreated={handleBuildProjectCreated} />
        )}

        {activePage === 'home' && (
        <>
            <div className="w-full md:w-[400px] flex flex-col border-r border-zinc-800 h-[40vh] md:h-screen relative z-30 bg-black shadow-xl shadow-black/50">
                <div className="h-16 flex items-center px-6 justify-between bg-black/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-800 shrink-0">
                    <span className="font-bold text-lg tracking-tight text-white">MaxiGen</span>
                    
                    <div className="flex bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                        <button 
                            onClick={() => setViewMode('design')} 
                            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium ${viewMode === 'design' ? 'bg-zinc-800 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            Design
                        </button>
                        <button 
                            onClick={() => setViewMode('prototype')} 
                            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${viewMode === 'prototype' ? 'bg-zinc-800 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Play size={10} fill={viewMode === 'prototype' ? "currentColor" : "none"} />
                            Prototype
                        </button>
                        <button 
                            onClick={() => setViewMode('deploy')} 
                            className={`px-3 py-1.5 rounded-md transition-all text-xs font-medium flex items-center gap-1.5 ${viewMode === 'deploy' ? 'bg-zinc-800 shadow-sm text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Rocket size={10} />
                            Deploy
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-black custom-scrollbar pb-32">
                {messages.map((msg, idx) => (
                    <motion.div
                    key={msg.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                    {msg.attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-zinc-700 shadow-sm max-w-[200px]">
                            <img src={`data:image/png;base64,${msg.attachment}`} alt="Attachment" className="w-full h-auto" />
                        </div>
                    )}
                    <div
                        className={`max-w-[90%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                            ? 'bg-white text-black rounded-[18px] rounded-br-sm'
                            : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-[18px] rounded-bl-sm'
                        }`}
                    >
                        {msg.content}
                    </div>
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pl-1 flex flex-wrap gap-1">
                            {msg.sources.slice(0, 3).map((source, i) => (
                                <a 
                                    key={i} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex items-center gap-1 text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-2 py-1 rounded-full border border-zinc-700 transition-colors"
                                >
                                    <Globe size={10} />
                                    <span className="truncate max-w-[100px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    )}
                    
                    {msg.role === 'assistant' && msg.suggestedIntegrations && msg.suggestedIntegrations.length > 0 && idx === messages.length - 1 && (
                        <div className="mt-3 w-full bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-xl p-4 text-white shadow-lg border border-zinc-700">
                             <div className="flex items-center gap-2 mb-3">
                                 <div className="p-1.5 bg-white/10 rounded-lg">
                                     <Zap size={16} className="text-yellow-400" fill="currentColor" />
                                 </div>
                                 <span className="font-bold text-sm">Make it Functional</span>
                             </div>
                             <p className="text-xs text-zinc-300 mb-4 leading-relaxed">
                                 Ready to turn this design into a real app? I can add these integrations for you:
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                 {msg.suggestedIntegrations.map((int, i) => (
                                     <span key={i} className="px-2 py-1 bg-white/10 rounded text-[10px] font-mono border border-white/5">{int}</span>
                                 ))}
                             </div>
                             <button 
                                onClick={() => { setViewMode('prototype'); setInput("Add these integrations and make the app fully functional."); }}
                                className="w-full py-2 bg-white text-black rounded-lg text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                             >
                                 <Play size={12} fill="currentColor" /> Start Prototype Mode
                             </button>
                        </div>
                    )}

                    {msg.role === 'assistant' && msg.appData && !msg.suggestedIntegrations && (
                        <span className="text-[10px] text-zinc-500 mt-1 pl-1 flex items-center gap-1">
                            {msg.appData.name.includes('Screens') ? (
                            <>
                                <Layers size={10} />
                                Generated {msg.appData.name}
                            </>
                            ) : (
                            <>
                                Generated "{msg.appData.name}"
                                <span className="w-1 h-1 rounded-full bg-zinc-600 mx-1"></span>
                                {msg.appData.platform === 'web' ? <Monitor size={8} /> : <Smartphone size={8} />}
                            </>
                            )}
                        </span>
                    )}
                    </motion.div>
                ))}
                
                {state === AppState.GENERATING && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pl-4">
                    <span className="text-xs font-medium text-zinc-500">
                        {generationMode === 'agentic' ? "Researching & Designing..." : selectedAppId ? "Redesigning..." : "Generating screens..."}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
                </div>

                <div className="absolute bottom-0 left-0 w-full p-4 bg-black/95 backdrop-blur-sm border-t border-zinc-800">
                
                <AnimatePresence>
                    {selectedAppId && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex items-center justify-between bg-blue-900/30 text-blue-300 px-3 py-2 rounded-lg mb-2 text-xs font-medium border border-blue-500/20"
                        >
                            <div className="flex items-center gap-2">
                                <Pencil size={12} />
                                <span>{viewMode === 'prototype' ? 'Editing in Prototype Mode' : `Redesigning ${canvasApps.find(a => a.id === selectedAppId)?.data.name}`}</span>
                            </div>
                            <button 
                                onClick={() => { setSelectedAppId(null); }}
                                className="p-1 hover:bg-blue-900/50 rounded text-blue-400"
                            >
                                <X size={12} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {pendingAttachment && (
                    <div className="relative inline-block mb-2">
                        <img src={`data:image/png;base64,${pendingAttachment}`} alt="Pending" className="h-16 rounded-md border border-zinc-700" />
                        <button 
                            onClick={() => setPendingAttachment(null)}
                            className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5 border border-zinc-700"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}

                <div className="shimmer-input-wrapper">
                    <div className="shimmer-input-content flex flex-col focus-within:ring-1 focus-within:ring-zinc-700 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={viewMode === 'prototype' ? "Describe functionality to add..." : (selectedAppId ? "Describe changes..." : "Describe your app...")}
                        className="w-full bg-transparent text-sm p-4 min-h-[50px] max-h-[120px] resize-none outline-none text-white placeholder:text-zinc-600 font-medium custom-scrollbar"
                        disabled={state === AppState.GENERATING}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    
                    <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1 relative">
                            <button 
                                onClick={() => setShowIntegrationsModal(true)}
                                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors" 
                                title="Add Integration"
                            >
                                <Plus size={18} />
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setShowAnnotationModal(true)}
                                className="p-2 rounded-full transition-colors hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300" 
                                title="Annotate & Edit"
                            >
                                <Pencil size={18} />
                            </button>

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
                            <button 
                                onClick={handleMicClick}
                                className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {isListening ? <AudioWave /> : <Mic size={18} />}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || state === AppState.GENERATING}
                                className="h-8 w-8 bg-white hover:bg-zinc-200 rounded-full flex items-center justify-center text-black transition-all shadow-sm active:scale-95 disabled:opacity-30 disabled:bg-zinc-800 disabled:text-zinc-500"
                            >
                                {state === AppState.GENERATING ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
                </div>
            </div>

            <div 
                className="flex-1 bg-black h-[60vh] md:h-screen relative overflow-hidden"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                {viewMode === 'design' ? (
                    <>
                        <div 
                            className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none origin-top-left transition-transform duration-75 cursor-grab active:cursor-grabbing"
                            style={{ 
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                            }}
                        />
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur rounded-full shadow-lg border border-zinc-800 z-50" onPointerDown={e => e.stopPropagation()}>
                            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"><ZoomOut size={16} /></button>
                            <span className="text-xs font-mono font-medium w-12 text-center text-zinc-500">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white"><ZoomIn size={16} /></button>
                            <div className="w-px h-4 bg-zinc-700 mx-1"></div>
                            <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white" title="Reset View"><RotateCcw size={16} /></button>
                            <button onClick={handleClearCanvas} className="p-2 hover:bg-red-900/30 hover:text-red-400 rounded-full text-zinc-400" title="Clear Canvas"><Trash2 size={16} /></button>
                        </div>

                        <motion.div 
                            ref={canvasRef}
                            className="w-full h-full relative pointer-events-none"
                            style={{ x: pan.x, y: pan.y, scale: zoom }}
                        >
                            <AnimatePresence>
                                {canvasApps.map(app => (
                                    <div key={app.id} className="pointer-events-auto">
                                        <DraggableApp 
                                            app={app} 
                                            isSelected={selectedAppId === app.id}
                                            onUpdate={updateAppPosition}
                                            onRemove={removeApp}
                                            onFocus={focusApp}
                                            onSelect={(id) => {
                                                setSelectedAppId(id);
                                                focusApp(id);
                                            }}
                                        />
                                    </div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    </>
                ) : viewMode === 'prototype' ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 p-8">
                        {selectedAppId && canvasApps.find(a => a.id === selectedAppId) ? (
                            <div className="w-full h-full bg-white rounded-[28px] shadow-2xl border border-zinc-800 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-10 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between px-4 z-10">
                                    <span className="text-xs font-bold text-zinc-600">
                                        {canvasApps.find(a => a.id === selectedAppId)?.data.name}
                                    </span>
                                    <div className="flex gap-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                                    </div>
                                </div>
                                <div className="pt-10 h-full">
                                    <MobileSimulator code={canvasApps.find(a => a.id === selectedAppId)?.data.webCompatibleCode || ''} />
                                </div>
                            </div>
                        ) : (
                             <div className="text-center text-zinc-600">
                                 <Smartphone size={48} className="mx-auto mb-4 opacity-20" />
                                 <p>Select an app to prototype</p>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                         {selectedAppId && canvasApps.find(a => a.id === selectedAppId) ? (
                            <DeployView app={canvasApps.find(a => a.id === selectedAppId)!.data} />
                         ) : (
                             <div className="text-center text-zinc-600">
                                 <Rocket size={48} className="mx-auto mb-4 opacity-20" />
                                 <p>Select an app to deploy</p>
                             </div>
                         )}
                    </div>
                )}
            </div>
        </>
        )}
      </div>
    </div>
  );
}
