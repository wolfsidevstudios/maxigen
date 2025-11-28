
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Code2, X, GripHorizontal, Maximize2, Minimize2, Pencil, Monitor } from 'lucide-react';
import { CanvasApp } from '../types';
import { MobileSimulator } from './MobileSimulator';
import { CodeViewer } from './CodeViewer';
import { AnnotationLayer, AnnotationLayerHandle } from './AnnotationLayer';

interface DraggableAppProps {
  app: CanvasApp;
  isSelected: boolean;
  onUpdate: (id: string, updates: Partial<CanvasApp>) => void;
  onRemove: (id: string) => void;
  onFocus: (id: string) => void;
  onSelect: (id: string) => void;
  isAnnotating?: boolean;
  annotationTool?: 'brush' | 'arrow' | 'box';
  annotationColor?: string;
  onCaptureRef?: (ref: AnnotationLayerHandle | null) => void;
}

export const DraggableApp: React.FC<DraggableAppProps> = ({ 
    app, isSelected, onUpdate, onRemove, onFocus, onSelect, 
    isAnnotating = false, annotationTool = 'brush', annotationColor = '#ef4444', onCaptureRef
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [isMinimized, setIsMinimized] = useState(false);
  const annotationRef = useRef<AnnotationLayerHandle>(null);

  // Pass the full handle back to parent when requested
  React.useEffect(() => {
    if (isSelected && onCaptureRef) {
        onCaptureRef(annotationRef.current);
    }
  }, [isSelected, onCaptureRef, isAnnotating]);

  const isWeb = app.data.platform === 'web';
  const widthClass = isWeb ? 'w-[960px]' : 'w-[320px]';
  const heightClass = isMinimized ? 'h-auto' : isWeb ? 'h-[540px]' : 'h-[640px]';
  
  // Dimensions for canvas (numeric)
  const width = isWeb ? 960 : 320;
  const height = isWeb ? 540 : 640;

  return (
    <motion.div
      drag={!isAnnotating} // Disable drag when drawing
      dragMomentum={false}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        zIndex: app.zIndex 
      }}
      onDragEnd={(_, info) => {
        onUpdate(app.id, { x: app.x + info.offset.x, y: app.y + info.offset.y });
      }}
      onPointerDown={() => onFocus(app.id)}
      style={{ x: app.x, y: app.y, position: 'absolute' }}
      className={`draggable-app-container flex flex-col rounded-[28px] bg-white overflow-hidden transition-shadow duration-200 ${widthClass}
        ${isSelected 
          ? 'ring-2 ring-blue-500 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]' 
          : 'ring-1 ring-black/5 shadow-2xl'
        }
      `}
    >
      {/* Handle / Header */}
      <div 
        className={`h-10 border-b flex items-center justify-between px-3 cursor-grab active:cursor-grabbing select-none group transition-colors
            ${isSelected ? 'bg-blue-50/50 border-blue-100' : 'bg-zinc-50 border-zinc-100'}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <GripHorizontal size={14} className={isSelected ? "text-blue-400" : "text-zinc-300"} />
          <span className={`text-xs font-semibold truncate ${isSelected ? "text-blue-700" : "text-zinc-700"}`}>
            {app.data.name}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-200/50 text-zinc-400 uppercase tracking-wide">
            {isWeb ? 'Web' : 'Mobile'}
          </span>
        </div>
        <div className="flex items-center gap-1">
           {/* Edit Button - Triggers Selection */}
           <button 
             onClick={(e) => { e.stopPropagation(); onSelect(app.id); }}
             className={`p-1 rounded-md transition-colors ${isSelected ? 'bg-blue-100 text-blue-600' : 'hover:bg-zinc-200 text-zinc-400'}`}
             title="Edit with AI"
           >
             <Pencil size={12} />
           </button>
           
           <div className="w-px h-3 bg-zinc-200 mx-0.5" />

           <button 
             onClick={() => setViewMode(viewMode === 'preview' ? 'code' : 'preview')}
             className={`p-1 rounded-md hover:bg-zinc-200 transition-colors ${viewMode === 'code' ? 'text-blue-600 bg-blue-50' : 'text-zinc-400'}`}
             title={viewMode === 'preview' ? "View Code" : "View Preview"}
           >
             {viewMode === 'preview' ? <Code2 size={12} /> : (isWeb ? <Monitor size={12} /> : <Smartphone size={12} />)}
           </button>
           <button 
             onClick={() => setIsMinimized(!isMinimized)}
             className="p-1 rounded-md hover:bg-zinc-200 transition-colors text-zinc-400"
           >
             {isMinimized ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); onRemove(app.id); }}
             className="p-1 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors text-zinc-400"
           >
             <X size={12} />
           </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className={`relative w-full bg-white group-active:pointer-events-none ${heightClass}`}>
          {viewMode === 'preview' ? (
             <>
                <MobileSimulator code={app.data.webCompatibleCode} />
                {isSelected && isAnnotating && (
                    <AnnotationLayer 
                        ref={annotationRef}
                        tool={annotationTool}
                        color={annotationColor}
                        width={width}
                        height={height}
                    />
                )}
             </>
          ) : (
             <div className="h-full w-full overflow-hidden">
                <CodeViewer code={app.data.reactNativeCode} language="tsx" />
             </div>
          )}
        </div>
      )}
    </motion.div>
  );
};
