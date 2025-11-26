
import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Undo2, Redo2, Square, Diamond, Circle, ArrowRight, Minus, Pencil, Type, Eraser, Grip, Lock, Hand, MousePointer2, Smartphone, Monitor, RectangleHorizontal, Star, Search, X, Trash2, AlignLeft } from 'lucide-react';
import { AnnotationLayer, AnnotationLayerHandle, AnnotationTool, CanvasElement } from './AnnotationLayer';
import { searchIcons, StreamlineIcon } from '../services/streamlineService';

interface SketchToAppProps {
  onClose: () => void;
  onGenerate: (image: string, prompt: string) => void;
}

export const SketchToApp: React.FC<SketchToAppProps> = ({ onClose, onGenerate }) => {
  const [tool, setTool] = useState<AnnotationTool>('brush');
  const [color, setColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [frame, setFrame] = useState<'mobile' | 'web'>('mobile');
  
  // Selection & Properties
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null);
  
  // Icon Sidebar State
  const [showIconPanel, setShowIconPanel] = useState(false);
  const [iconQuery, setIconQuery] = useState('');
  const [icons, setIcons] = useState<StreamlineIcon[]>([]);
  const [isLoadingIcons, setIsLoadingIcons] = useState(false);

  const layerRef = useRef<AnnotationLayerHandle>(null);

  useEffect(() => {
    if (showIconPanel) {
        handleIconSearch(''); 
    }
  }, [showIconPanel]);

  const handleIconSearch = async (q: string) => {
      setIsLoadingIcons(true);
      const results = await searchIcons(q);
      setIcons(results.length > 0 ? results : []);
      setIsLoadingIcons(false);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
        alert("Please describe what you want to build.");
        return;
    }
    
    if (layerRef.current) {
        setIsGenerating(true);
        const base64 = await layerRef.current.capture();
        if (base64) {
            onGenerate(base64, prompt);
        } else {
            setIsGenerating(false);
        }
    }
  };

  const handleDragStart = (e: React.DragEvent, svg: string) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    e.dataTransfer.setData('text/plain', url);
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      const url = e.dataTransfer.getData('text/plain');
      if (url && layerRef.current) {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          layerRef.current.pasteImage(url, x, y);
      }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  // Explicit dimensions
  const frameWidth = frame === 'web' ? 960 : 320;
  const frameHeight = frame === 'web' ? 540 : 640;

  const updateProp = (key: keyof CanvasElement, value: any) => {
      if (selectedElement && layerRef.current) {
          layerRef.current.updateElement(selectedElement.id, { [key]: value });
          setSelectedElement({ ...selectedElement, [key]: value }); 
      }
  };

  return (
    <div className="fixed inset-0 bg-zinc-50 z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-4 gap-4 z-30 relative shrink-0">
            <div className="flex items-center gap-4 shrink-0">
                <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-600 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <span className="font-bold text-zinc-900 hidden sm:block">Sketch to Design</span>
            </div>

            <div className="flex-1 max-w-xl">
                 <div className="bg-zinc-100 p-1.5 rounded-xl border border-zinc-200 flex gap-2 focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5 transition-all">
                     <input 
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        placeholder="Describe your sketch..."
                        className="flex-1 px-3 py-1 outline-none text-zinc-900 placeholder:text-zinc-500 font-medium bg-transparent text-sm"
                     />
                 </div>
            </div>

            <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-black text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-zinc-800 transition-colors disabled:opacity-50 shrink-0"
            >
                <Sparkles size={16} />
                <span className="hidden sm:inline">{isGenerating ? "Building..." : "Make it Real"}</span>
            </button>
        </div>

        {/* Toolbar */}
         <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1.5 px-4 bg-white rounded-full shadow-xl border border-zinc-200 z-20">
            <ToolBtn tool="select" current={tool} icon={<MousePointer2 size={16} />} onClick={() => setTool('select')} label="Select" />
            <div className="w-px h-5 bg-zinc-200 mx-1"></div>
            <ToolBtn tool="pan" current={tool} icon={<Hand size={16} />} onClick={() => setTool('pan')} />
            <ToolBtn tool="rect" current={tool} icon={<Square size={16} />} onClick={() => setTool('rect')} label="Box" />
            <ToolBtn tool="bar" current={tool} icon={<RectangleHorizontal size={16} />} onClick={() => setTool('bar')} label="Bar" />
            <ToolBtn tool="circle" current={tool} icon={<Circle size={16} />} onClick={() => setTool('circle')} label="Circle" />
            <div className="w-px h-5 bg-zinc-200 mx-1"></div>
            <ToolBtn tool="brush" current={tool} icon={<Pencil size={16} />} onClick={() => setTool('brush')} label="Draw" />
            <ToolBtn tool="text" current={tool} icon={<Type size={16} />} onClick={() => setTool('text')} label="Text" />
            <ToolBtn tool="eraser" current={tool} icon={<Eraser size={16} />} onClick={() => setTool('eraser')} label="Erase" />
            <div className="w-px h-5 bg-zinc-200 mx-1"></div>
            <button 
                onClick={() => setShowIconPanel(!showIconPanel)}
                className={`p-2 rounded-full transition-all flex flex-col items-center justify-center gap-0.5 min-w-[36px] relative group ${showIconPanel ? 'bg-amber-100 text-amber-600' : 'text-zinc-600 hover:bg-zinc-100'}`}
            >
                <Star size={16} />
            </button>
        </div>

        {/* Left Side Controls */}
        <div className="absolute top-20 left-6 z-20 flex flex-col gap-3">
             <AnimatePresence>
                 {tool === 'select' && selectedElement ? (
                     <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white p-4 rounded-2xl shadow-xl border border-zinc-200 w-64 flex flex-col gap-4"
                     >
                         <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                             <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{selectedElement?.type} Settings</span>
                             <button onClick={() => layerRef.current?.deleteSelected()} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={14}/></button>
                         </div>
                         <div className="space-y-2">
                             <label className="text-xs text-zinc-500">Fill Color</label>
                             <div className="flex gap-2">
                                 <input type="color" value={selectedElement?.fill === 'none' ? '#ffffff' : selectedElement?.fill} onChange={e => updateProp('fill', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                                 <button onClick={() => updateProp('fill', 'none')} className="text-xs border px-2 rounded hover:bg-zinc-50">None</button>
                             </div>
                         </div>
                     </motion.div>
                 ) : (
                     <div className="bg-white p-2 rounded-xl shadow-lg border border-zinc-200 flex flex-col gap-2 items-center">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-200 ring-2 ring-white shadow-sm hover:scale-105 transition-transform bg-black">
                            <input 
                                type="color" 
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                            />
                            <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: color }}></div>
                        </div>
                        <div className="w-full h-px bg-zinc-100"></div>
                        <button onClick={() => layerRef.current?.undo()} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500"><Undo2 size={16}/></button>
                        <button onClick={() => layerRef.current?.redo()} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500"><Redo2 size={16}/></button>
                    </div>
                 )}
             </AnimatePresence>

             <div className="bg-white p-1 rounded-xl shadow-lg border border-zinc-200 flex flex-col gap-1 items-center w-min self-center mt-2">
                 <button onClick={() => setFrame('mobile')} className={`p-2 rounded-lg transition-all ${frame === 'mobile' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-400'}`} title="Mobile Frame"><Smartphone size={20} /></button>
                 <button onClick={() => setFrame('web')} className={`p-2 rounded-lg transition-all ${frame === 'web' ? 'bg-black text-white' : 'hover:bg-zinc-100 text-zinc-400'}`} title="Web Frame"><Monitor size={20} /></button>
             </div>
        </div>

        {/* Icon Panel */}
        <AnimatePresence>
            {showIconPanel && (
                <motion.div 
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 300, opacity: 0 }}
                    className="absolute top-20 right-6 bottom-6 w-80 bg-white rounded-[32px] shadow-2xl border border-zinc-200 z-40 flex flex-col overflow-hidden"
                >
                    <div className="p-6 pb-4 border-b border-zinc-100 flex items-center justify-between">
                        <span className="font-bold text-lg">Icons</span>
                        <button onClick={() => setShowIconPanel(false)} className="p-1 hover:bg-zinc-100 rounded-full text-zinc-400"><X size={18} /></button>
                    </div>
                    <div className="px-6 py-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input value={iconQuery} onChange={e => { setIconQuery(e.target.value); handleIconSearch(e.target.value); }} placeholder="Search..." className="w-full pl-9 pr-3 py-2 bg-zinc-50 rounded-xl text-sm border border-transparent focus:bg-white focus:border-zinc-200 outline-none" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar grid grid-cols-4 gap-3 content-start">
                         {icons.map((icon) => (
                             <div key={icon.id} draggable onDragStart={(e) => handleDragStart(e, icon.svg)} className="aspect-square bg-zinc-50 rounded-xl flex items-center justify-center border border-zinc-100 p-2 cursor-grab active:cursor-grabbing hover:bg-zinc-100 transition-colors" title={icon.name} dangerouslySetInnerHTML={{ __html: icon.svg }} />
                         ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* CANVAS WORKSPACE */}
        <div className="flex-1 bg-zinc-100 flex items-center justify-center overflow-auto p-8">
            <div 
                className={`relative bg-white shadow-2xl transition-all duration-300 overflow-hidden flex flex-col
                    ${frame === 'mobile' ? 'rounded-[40px] border-[8px] border-zinc-800' : 'rounded-lg border border-zinc-300'}
                `}
                style={{ 
                    width: frameWidth, 
                    height: frameHeight,
                    boxShadow: frame === 'mobile' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
                }}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                {/* Frame Header Decoration */}
                {frame === 'mobile' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-6 bg-zinc-800 rounded-b-xl z-10 pointer-events-none" />
                )}
                {frame === 'web' && (
                    <div className="h-6 bg-zinc-100 border-b border-zinc-200 flex items-center px-2 gap-1.5 shrink-0 pointer-events-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                )}

                <div className="flex-1 relative cursor-crosshair">
                     {/* Grid BG */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                    
                    <AnnotationLayer 
                        ref={layerRef}
                        tool={tool}
                        color={color}
                        width={frameWidth}
                        height={frame === 'web' ? frameHeight - 24 : frameHeight} 
                        onSelect={setSelectedElement} 
                    />
                </div>
            </div>
        </div>
    </div>
  );
};

const ToolBtn: React.FC<{ tool: AnnotationTool, current: AnnotationTool, icon: React.ReactNode, onClick: () => void, label?: string, disabled?: boolean }> = ({ tool, current, icon, onClick, label, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-full transition-all flex flex-col items-center justify-center gap-0.5 min-w-[36px] relative group ${current === tool ? 'bg-blue-100 text-blue-700' : 'text-zinc-600 hover:bg-zinc-100'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
        {icon}
        {label && <span className="absolute bottom-0.5 right-1 text-[8px] font-medium opacity-50">{label}</span>}
    </button>
);
