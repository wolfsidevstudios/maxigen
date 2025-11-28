
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Smartphone, Monitor, MousePointer, PenTool, Square, Undo2, Redo2, ImageIcon, Lock, Hand, MousePointer2, Circle, Diamond, ArrowRight, Minus, Pencil, Type, Eraser, Grip } from 'lucide-react';
import { CanvasApp } from '../types';
import { MobileSimulator } from './MobileSimulator';
import { AnnotationLayer, AnnotationLayerHandle, AnnotationTool } from './AnnotationLayer';

interface AnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  apps: CanvasApp[];
  onCapture: (image: string) => void;
}

export const AnnotationModal: React.FC<AnnotationModalProps> = ({ isOpen, onClose, apps, onCapture }) => {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [tool, setTool] = useState<AnnotationTool>('brush');
  const [color, setColor] = useState('#ef4444');
  
  const annotationRef = useRef<AnnotationLayerHandle>(null);

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleCapture = async () => {
    if (annotationRef.current) {
        const base64 = await annotationRef.current.capture();
        if (base64) {
            onCapture(base64);
            handleClose();
        }
    }
  };

  const handleClose = () => {
    setSelectedAppId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full h-full max-w-[1400px] bg-zinc-900 rounded-[24px] shadow-2xl overflow-hidden flex flex-col border border-zinc-800"
        >
            {/* Header */}
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 relative z-30">
                <div className="flex items-center gap-4">
                    {selectedApp ? (
                        <button 
                            onClick={() => setSelectedAppId(null)}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} />
                            <span className="font-medium text-sm">Back</span>
                        </button>
                    ) : (
                        <span className="font-bold text-base text-white">Select a Screen</span>
                    )}
                </div>
                
                <button 
                    onClick={handleClose}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative bg-black flex flex-col">
                
                <AnimatePresence mode="wait">
                    {!selectedApp ? (
                        /* SELECTION GRID */
                        <motion.div 
                            key="selection"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto h-full custom-scrollbar"
                        >
                            {apps.map(app => (
                                <button
                                    key={app.id}
                                    onClick={() => setSelectedAppId(app.id)}
                                    className="group relative aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:ring-4 hover:ring-blue-900/20 transition-all shadow-sm hover:shadow-xl overflow-hidden text-left flex flex-col"
                                >
                                    <div className="h-9 border-b border-zinc-800 flex items-center px-4 justify-between bg-zinc-900">
                                        <span className="font-medium text-xs text-zinc-400 truncate">{app.data.name}</span>
                                        {app.data.platform === 'web' ? <Monitor size={12} className="text-zinc-600"/> : <Smartphone size={12} className="text-zinc-600" />}
                                    </div>
                                    <div className="flex-1 w-full relative overflow-hidden bg-white pointer-events-none">
                                        <div className="absolute inset-0 transform scale-[0.4] origin-top-left w-[250%] h-[250%]">
                                             <MobileSimulator code={app.data.webCompatibleCode} />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-blue-500/5 transition-colors" />
                                </button>
                            ))}
                        </motion.div>
                    ) : (
                        /* ANNOTATION EDITOR */
                        <motion.div 
                            key="editor"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full flex flex-col relative"
                        >
                            {/* Toolbar (Fixed Top) */}
                            <div className="w-full flex justify-center pt-4 pb-2 relative z-40 bg-transparent pointer-events-none">
                                <div className="bg-zinc-900 pointer-events-auto rounded-lg shadow-lg border border-zinc-700 flex items-center p-1 gap-1">
                                    
                                    {/* Group 1: Lock/Hand/Select */}
                                    <ToolBtn tool="select" current={tool} icon={<Lock size={16} />} onClick={() => {}} disabled />
                                    <div className="w-px h-5 bg-zinc-700 mx-0.5"></div>
                                    <ToolBtn tool="pan" current={tool} icon={<Hand size={16} />} onClick={() => setTool('pan')} />
                                    <ToolBtn tool="select" current={tool} icon={<MousePointer2 size={16} />} onClick={() => setTool('select')} label="1" />
                                    
                                    <div className="w-px h-5 bg-zinc-700 mx-0.5"></div>
                                    
                                    {/* Group 2: Shapes */}
                                    <ToolBtn tool="rect" current={tool} icon={<Square size={16} />} onClick={() => setTool('rect')} label="2" />
                                    <ToolBtn tool="diamond" current={tool} icon={<Diamond size={16} />} onClick={() => setTool('diamond')} label="3" />
                                    <ToolBtn tool="circle" current={tool} icon={<Circle size={16} />} onClick={() => setTool('circle')} label="4" />
                                    <ToolBtn tool="arrow" current={tool} icon={<ArrowRight size={16} />} onClick={() => setTool('arrow')} label="5" />
                                    <ToolBtn tool="line" current={tool} icon={<Minus size={16} />} onClick={() => setTool('line')} label="6" />
                                    
                                    <div className="w-px h-5 bg-zinc-700 mx-0.5"></div>
                                    
                                    {/* Group 3: Draw/Text/Erase */}
                                    <ToolBtn tool="brush" current={tool} icon={<Pencil size={16} />} onClick={() => setTool('brush')} label="7" />
                                    <ToolBtn tool="text" current={tool} icon={<Type size={16} />} onClick={() => setTool('text')} label="8" />
                                    <ToolBtn tool="eraser" current={tool} icon={<Eraser size={16} />} onClick={() => setTool('eraser')} label="0" />
                                </div>
                            </div>
                            
                            {/* Sub-toolbar (Color/Undo) */}
                             <div className="absolute top-20 left-4 z-40 bg-zinc-900 p-1.5 rounded-lg border border-zinc-700 shadow-sm flex flex-col gap-2">
                                <div className="relative w-8 h-8 rounded-md overflow-hidden border border-zinc-700 ring-1 ring-zinc-500 shadow-sm hover:scale-105 transition-transform bg-black">
                                    <input 
                                        type="color" 
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 border-0 opacity-0"
                                    />
                                    <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: color }}></div>
                                </div>
                                <div className="w-full h-px bg-zinc-700"></div>
                                <button onClick={() => annotationRef.current?.undo()} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Undo">
                                    <Undo2 size={16} />
                                </button>
                                <button onClick={() => annotationRef.current?.redo()} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors" title="Redo">
                                    <Redo2 size={16} />
                                </button>
                            </div>

                            {/* Canvas / App Container */}
                            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-black custom-scrollbar">
                                <div className="relative shadow-2xl shadow-black rounded-lg overflow-hidden border border-zinc-800 bg-white">
                                    <div 
                                        style={{ 
                                            width: selectedApp.data.platform === 'web' ? 960 : 375, 
                                            height: selectedApp.data.platform === 'web' ? 540 : 667
                                        }}
                                        className="relative"
                                    >
                                        <MobileSimulator code={selectedApp.data.webCompatibleCode} />
                                        <AnnotationLayer 
                                            ref={annotationRef}
                                            tool={tool}
                                            color={color}
                                            width={selectedApp.data.platform === 'web' ? 960 : 375}
                                            height={selectedApp.data.platform === 'web' ? 540 : 667}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Add To Chat Button (Bottom Right) */}
                            <button 
                                onClick={handleCapture}
                                className="absolute bottom-8 right-8 bg-white text-black px-5 py-2.5 rounded-full text-sm font-bold shadow-lg hover:bg-zinc-200 transition-all flex items-center gap-2 z-40 active:scale-95"
                            >
                                <ImageIcon size={16} />
                                <span>Add to Chat</span>
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </motion.div>
    </div>
  );
};

const ToolBtn: React.FC<{ tool: AnnotationTool, current: AnnotationTool, icon: React.ReactNode, onClick: () => void, label?: string, disabled?: boolean }> = ({ tool, current, icon, onClick, label, disabled }) => (
    <button 
        onClick={onClick}
        disabled={disabled}
        className={`
            p-2 rounded-md transition-all flex flex-col items-center justify-center gap-0.5 min-w-[36px] relative group
            ${current === tool ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}
            ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        `}
    >
        {icon}
        {label && <span className="absolute bottom-0.5 right-1 text-[8px] font-medium opacity-50">{label}</span>}
    </button>
);