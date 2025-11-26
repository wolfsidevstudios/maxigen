
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Zap, ArrowRight, Layout, MousePointer2, ZoomIn, ZoomOut, RotateCcw, Trash2, X, Pencil, Plus, Mic, AudioLines, ArrowUp, Smartphone, Monitor, Layers, PenTool, MousePointer, Square, Image as ImageIcon, Undo2, Redo2, MoreHorizontal, Sparkles, Copy, Bot, Link as LinkIcon, Palette, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateAppCode, editAppCode } from './services/geminiService';
import { speechToText } from './services/speechService';
import { DraggableApp } from './components/DraggableApp';
import { Sidebar } from './components/Sidebar';
import { ProjectsPage } from './components/ProjectsPage';
import { AnnotationModal } from './components/AnnotationModal';
import { AudioWave } from './components/AudioWave';
import { ChatMessage, AppState, CanvasApp, Platform, Page, UserProfile, Project, GenerationMode } from './types';

interface LandingPageProps {
  onSearch: (text: string, image?: string, mode?: GenerationMode, url?: string) => void;
  platform: Platform;
  setPlatform: (p: Platform) => void;
  generationMode: GenerationMode;
  setGenerationMode: (m: GenerationMode) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSearch, platform, setPlatform, generationMode, setGenerationMode }) => {
  const [text, setText] = useState('');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
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
      if (generationMode === 'redesign') return 'bg-purple-50 border-purple-100 ring-purple-100';
      if (generationMode === 'copy') return 'bg-blue-50 border-blue-100 ring-blue-100';
      if (generationMode === 'agentic') return 'bg-teal-50 border-teal-100 ring-teal-100';
      return 'bg-white shadow-xl shadow-black/5 ring-1 ring-black/5';
  };

  return (
      <div className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto px-6 relative">
          
          <div className="mb-8 p-4 bg-zinc-100 rounded-[28px] border border-zinc-200 shadow-sm">
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/20">
                  <Zap size={32} className="fill-white text-white" />
              </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4 text-center">
              What will you build today?
          </h1>
          <p className="text-lg text-zinc-500 mb-10 max-w-lg leading-relaxed text-center">
              Describe your dream app, and MaxiGen will bring it to life in seconds.
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-2xl relative group z-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-teal-100 rounded-[32px] blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              
              <div className={`relative flex flex-col rounded-[32px] p-2 transition-all group-focus-within:ring-2 ${getModeColor()}`}>
                  
                  {/* Mode Banner */}
                  {generationMode !== 'default' && (
                      <div className="flex items-center justify-between px-6 pt-3 pb-1">
                          <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
                              generationMode === 'redesign' ? 'text-purple-600' : 
                              generationMode === 'copy' ? 'text-blue-600' : 'text-teal-600'
                          }`}>
                              {generationMode === 'redesign' && <Sparkles size={14} />}
                              {generationMode === 'copy' && <Copy size={14} />}
                              {generationMode === 'agentic' && <Bot size={14} />}
                              {generationMode === 'redesign' ? "Redesign Mode" : generationMode === 'copy' ? "Copy & Design Mode" : "Agentic Mode"}
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setGenerationMode('default')}
                            className="text-zinc-400 hover:text-zinc-600"
                          >
                              <X size={14} />
                          </button>
                      </div>
                  )}

                  {/* URL Input for Special Modes */}
                  {(generationMode === 'redesign' || generationMode === 'copy') && (
                      <div className="px-6 py-2 flex items-center gap-2 border-b border-black/5">
                          <LinkIcon size={16} className="text-zinc-400" />
                          <input 
                              value={referenceUrl}
                              onChange={(e) => setReferenceUrl(e.target.value)}
                              placeholder={generationMode === 'redesign' ? "Paste App URL to Redesign (Optional)" : "Paste Style Reference URL (Optional)"}
                              className="flex-1 bg-transparent text-sm outline-none text-zinc-700 placeholder:text-zinc-400"
                          />
                      </div>
                  )}

                  {/* Textarea Area */}
                  <textarea 
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={getPlaceholder()} 
                      className="w-full bg-transparent border-none outline-none px-6 py-4 text-xl text-zinc-900 placeholder:text-zinc-300 font-medium resize-none h-[120px] custom-scrollbar"
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
                            <img src={`data:image/png;base64,${attachedImage}`} alt="Reference" className="h-16 w-auto rounded-lg border border-zinc-200 shadow-sm" />
                            <button 
                                type="button"
                                onClick={() => setAttachedImage(null)}
                                className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    </div>
                  )}

                  {/* Bottom Toolbar */}
                  <div className="flex items-center justify-between px-4 pb-2">
                      <div className="flex items-center gap-1 text-zinc-400">
                          <input 
                              type="file" 
                              ref={fileInputRef} 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleFileSelect}
                          />
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()} 
                            className={`p-2 rounded-full transition-colors flex items-center gap-2 ${generationMode !== 'default' && !attachedImage ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'hover:bg-zinc-100 hover:text-zinc-600'}`} 
                            title="Upload Reference Image"
                          >
                              <Plus size={20} />
                              {(generationMode === 'redesign' || generationMode === 'copy') && !attachedImage && (
                                  <span className="text-xs font-semibold whitespace-nowrap pr-2">Upload Image</span>
                              )}
                          </button>
                          
                          <div className="w-px h-5 bg-zinc-200 mx-2"></div>
                          
                          {/* Platform Toggle (Integrated) */}
                          <div className="flex bg-zinc-100 rounded-full p-0.5 border border-zinc-200/50">
                              <button 
                                  type="button"
                                  onClick={() => setPlatform('mobile')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${platform === 'mobile' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                              >
                                  <Smartphone size={14} />
                                  <span>Mobile</span>
                              </button>
                              <button 
                                  type="button"
                                  onClick={() => setPlatform('web')}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${platform === 'web' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
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
                            className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-100 text-black' : 'hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600'}`}
                          >
                              {isListening ? <AudioWave /> : <Mic size={20} />}
                          </button>

                          {/* 3 Dots Menu */}
                          <div className="relative" ref={menuRef}>
                              <button 
                                type="button" 
                                onClick={() => setShowMenu(!showMenu)}
                                className={`p-2 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors ${showMenu ? 'bg-zinc-100 text-zinc-600' : 'hover:bg-zinc-100'}`}
                              >
                                <MoreHorizontal size={20} />
                              </button>
                              
                              <AnimatePresence>
                                {showMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50 py-1"
                                    >
                                        <div className="px-3 py-2 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Beta Tools</div>
                                        <button 
                                            type="button" 
                                            onClick={() => { setShowMenu(false); setGenerationMode('redesign'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'redesign' ? 'bg-purple-50 text-purple-700' : 'hover:bg-zinc-50 text-zinc-700'}`}
                                        >
                                            <Sparkles size={14} />
                                            Redesign Mode
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => { setShowMenu(false); setGenerationMode('copy'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'copy' ? 'bg-blue-50 text-blue-700' : 'hover:bg-zinc-50 text-zinc-700'}`}
                                        >
                                            <Copy size={14} />
                                            Copy & Design
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => { setShowMenu(false); setGenerationMode('agentic'); }}
                                            className={`w-full text-left px-4 py-2.5 flex items-center gap-2 text-sm ${generationMode === 'agentic' ? 'bg-teal-50 text-teal-700' : 'hover:bg-zinc-50 text-zinc-700'}`}
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
                              className="h-10 w-10 bg-black hover:bg-zinc-800 text-white rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-30"
                          >
                              <ArrowUp size={20} strokeWidth={2.5} />
                          </button>
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
                      className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-sm text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                      {suggestion}
                  </button>
              ))}
          </div>
      </div>
  );
};

export default function App() {
  // Navigation & User State
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
  const [referenceUrl, setReferenceUrl] = useState('');

  // Annotation State
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<string | null>(null);
  
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sync projects with canvasApps creation
  useEffect(() => {
    if (canvasApps.length > projects.length) {
        const newApps = canvasApps.slice(projects.length);
        const newProjects = newApps.map(app => ({
            id: app.id,
            name: app.data.name,
            platform: app.data.platform,
            lastEdited: 'Just now',
            icon: app.data.icon // Use generated SVG
        }));
        setProjects(prev => [...prev, ...newProjects]);
    }
  }, [canvasApps.length]);

  const handleNewProject = () => {
      setMessages([]);
      setCanvasApps([]);
      setSelectedAppId(null);
      setState(AppState.IDLE);
      setZoom(1);
      setPan({x: 0, y: 0});
      setActivePage('home');
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

    // Reset mode after submission unless it was just editing
    if (!selectedAppId) {
        setGenerationMode('default');
        setReferenceUrl('');
    }

    try {
      if (selectedAppId) {
        // --- EDIT MODE ---
        const appToEdit = canvasApps.find(app => app.id === selectedAppId);
        if (!appToEdit) throw new Error("Selected app not found");

        const result = await editAppCode(appToEdit.data, text, userMessage.attachment);

        const aiMessage: ChatMessage = {
          role: 'assistant',
          content: `Redesigned ${result.name}: ${result.explanation}`,
          appData: result,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, aiMessage]);
        
        setCanvasApps(prev => prev.map(app => 
            app.id === selectedAppId ? { ...app, data: result } : app
        ));

        setState(AppState.SUCCESS);

      } else {
        // --- CREATE MODE (Default, Redesign, Copy, Agentic) ---
        const { screens, explanation, sources } = await generateAppCode(text, platform, userMessage.attachment, usedMode, url || referenceUrl);
        
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
          sources: sources
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
    // Optionally focus input
  };

  // --- PANNING HANDLERS ---
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.target === e.currentTarget) {
        isDragging.current = true;
        lastPointerPosition.current = { x: e.clientX, y: e.clientY };
        e.currentTarget.setPointerCapture(e.pointerId);
        setSelectedAppId(null); 
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging.current) {
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

  // --- RENDER ---
  
  // 1. LANDING PAGE
  if (messages.length === 0 && canvasApps.length === 0 && activePage === 'home') {
      return (
        <div className="flex h-screen w-full bg-zinc-50 font-sans selection:bg-black selection:text-white">
            <Sidebar activePage={activePage} onNavigate={setActivePage} recentProjects={projects} onNewProject={handleNewProject} />
            <div className="flex-1 relative overflow-hidden">
                <LandingPage 
                    onSearch={processInput} 
                    platform={platform} 
                    setPlatform={setPlatform} 
                    generationMode={generationMode}
                    setGenerationMode={setGenerationMode}
                />
            </div>
        </div>
      );
  }

  // 2. MAIN LAYOUT
  return (
    <div className="h-screen bg-zinc-50 text-zinc-950 flex overflow-hidden font-sans selection:bg-black selection:text-white">
      
      {/* GLOBAL SIDEBAR */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} recentProjects={projects} onNewProject={handleNewProject} />
      
      {/* ANNOTATION MODAL */}
      <AnnotationModal 
        isOpen={showAnnotationModal}
        onClose={() => setShowAnnotationModal(false)}
        apps={canvasApps}
        onCapture={handleAnnotationCapture}
      />

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row relative overflow-hidden">
        
        {/* VIEW: PROJECTS / SETTINGS */}
        {activePage === 'projects' && (
            <ProjectsPage profile={userProfile} projects={projects} onUpdateProfile={setUserProfile} />
        )}
        
        {activePage === 'settings' && (
            <div className="flex-1 p-12 text-center text-zinc-500">Settings Page (Coming Soon)</div>
        )}

        {/* VIEW: HOME (Chat + Canvas) */}
        {activePage === 'home' && (
        <>
            {/* Left Panel: Chat & History */}
            <div className="w-full md:w-[400px] flex flex-col border-r border-zinc-200 h-[40vh] md:h-screen relative z-30 bg-white shadow-xl shadow-zinc-200/50">
                {/* Header */}
                <div className="h-16 flex items-center px-6 justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-100">
                <span className="font-bold text-lg tracking-tight">MaxiGen</span>
                
                <div className="flex items-center gap-2">
                    <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
                        <button 
                            onClick={() => setPlatform('mobile')} 
                            className={`p-1 rounded-md transition-all ${platform === 'mobile' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                            title="Mobile App"
                        >
                            <Smartphone size={14} />
                        </button>
                        <button 
                            onClick={() => setPlatform('web')} 
                            className={`p-1 rounded-md transition-all ${platform === 'web' ? 'bg-white shadow-sm text-black' : 'text-zinc-400 hover:text-zinc-600'}`}
                            title="Web App"
                        >
                            <Monitor size={14} />
                        </button>
                    </div>
                </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 bg-white custom-scrollbar pb-32">
                {messages.map((msg, idx) => (
                    <motion.div
                    key={msg.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                    {msg.attachment && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-zinc-200 shadow-sm max-w-[200px]">
                            <img src={`data:image/png;base64,${msg.attachment}`} alt="Attachment" className="w-full h-auto" />
                        </div>
                    )}
                    <div
                        className={`max-w-[90%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                        msg.role === 'user'
                            ? 'bg-black text-white rounded-[18px] rounded-br-sm'
                            : 'bg-zinc-50 text-zinc-800 border border-zinc-100 rounded-[18px] rounded-bl-sm'
                        }`}
                    >
                        {msg.content}
                    </div>
                    {/* Source citations for Agentic Mode */}
                    {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 pl-1 flex flex-wrap gap-1">
                            {msg.sources.slice(0, 3).map((source, i) => (
                                <a 
                                    key={i} 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex items-center gap-1 text-[10px] bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-2 py-1 rounded-full border border-zinc-200 transition-colors"
                                >
                                    <Globe size={10} />
                                    <span className="truncate max-w-[100px]">{source.title}</span>
                                </a>
                            ))}
                        </div>
                    )}
                    {msg.role === 'assistant' && msg.appData && (
                        <span className="text-[10px] text-zinc-400 mt-1 pl-1 flex items-center gap-1">
                            {msg.appData.name.includes('Screens') ? (
                            <>
                                <Layers size={10} />
                                Generated {msg.appData.name}
                            </>
                            ) : (
                            <>
                                Generated "{msg.appData.name}"
                                <span className="w-1 h-1 rounded-full bg-zinc-300 mx-1"></span>
                                {msg.appData.platform === 'web' ? <Monitor size={8} /> : <Smartphone size={8} />}
                            </>
                            )}
                        </span>
                    )}
                    </motion.div>
                ))}
                
                {state === AppState.GENERATING && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 pl-4">
                    <span className="text-xs font-medium text-zinc-400">
                        {generationMode === 'agentic' ? "Researching & Designing..." : selectedAppId ? "Redesigning..." : "Generating screens..."}
                    </span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div className="absolute bottom-0 left-0 w-full p-4 bg-white/95 backdrop-blur-sm border-t border-zinc-100">
                
                <AnimatePresence>
                    {selectedAppId && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="flex items-center justify-between bg-blue-50 text-blue-700 px-3 py-2 rounded-lg mb-2 text-xs font-medium border border-blue-100"
                        >
                            <div className="flex items-center gap-2">
                                <Pencil size={12} />
                                <span>Redesigning <b>{canvasApps.find(a => a.id === selectedAppId)?.data.name}</b></span>
                            </div>
                            <button 
                                onClick={() => { setSelectedAppId(null); }}
                                className="p-1 hover:bg-blue-100 rounded text-blue-500"
                            >
                                <X size={12} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {pendingAttachment && (
                    <div className="relative inline-block mb-2">
                        <img src={`data:image/png;base64,${pendingAttachment}`} alt="Pending" className="h-16 rounded-md border border-zinc-200" />
                        <button 
                            onClick={() => setPendingAttachment(null)}
                            className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}

                <div className="relative w-full bg-zinc-100 rounded-[24px] border border-transparent focus-within:bg-white focus-within:border-zinc-300 focus-within:shadow-md transition-all flex flex-col">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedAppId ? "Describe changes..." : "Describe your app..."}
                        className="w-full bg-transparent text-sm p-4 min-h-[50px] max-h-[120px] resize-none outline-none text-zinc-900 placeholder:text-zinc-500 font-medium custom-scrollbar"
                        disabled={state === AppState.GENERATING}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    
                    <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-zinc-200 rounded-full text-zinc-500 transition-colors" title="Add Image">
                                <Plus size={18} />
                            </button>
                            
                            <button 
                                type="button"
                                onClick={() => setShowAnnotationModal(true)}
                                className="p-2 rounded-full transition-colors hover:bg-zinc-200 text-zinc-500" 
                                title="Annotate & Edit"
                            >
                                <Pencil size={18} />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleMicClick}
                                className={`p-2 rounded-full transition-colors flex items-center justify-center ${isListening ? 'bg-zinc-200 text-black' : 'hover:bg-zinc-200 text-zinc-500'}`}
                            >
                                {isListening ? <AudioWave /> : <Mic size={18} />}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || state === AppState.GENERATING}
                                className="h-8 w-8 bg-black hover:bg-zinc-800 rounded-full flex items-center justify-center text-white transition-all shadow-sm active:scale-95 disabled:opacity-30"
                            >
                                {state === AppState.GENERATING ? <Loader2 size={14} className="animate-spin" /> : <ArrowUp size={16} strokeWidth={2.5} />}
                            </button>
                        </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Right Panel: Infinite Canvas */}
            <div 
                className="flex-1 bg-zinc-50 h-[60vh] md:h-screen relative overflow-hidden cursor-grab active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
            >
                
                <div 
                    className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none origin-top-left transition-transform duration-75"
                    style={{ 
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                    }}
                />

                {/* Canvas Toolbar */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-white rounded-full shadow-lg border border-zinc-100 z-50" onPointerDown={e => e.stopPropagation()}>
                    <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"><ZoomOut size={16} /></button>
                    <span className="text-xs font-mono font-medium w-12 text-center text-zinc-400">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500"><ZoomIn size={16} /></button>
                    <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                    <button onClick={() => { setZoom(1); setPan({x:0,y:0}); }} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-500" title="Reset View"><RotateCcw size={16} /></button>
                    <button onClick={handleClearCanvas} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full text-zinc-500" title="Clear Canvas"><Trash2 size={16} /></button>
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
            </div>
        </>
        )}
      </div>
    </div>
  );
}
