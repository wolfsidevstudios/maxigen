
import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Check, Loader2, Cloud, Sun, CloudRain, Snowflake, Wind } from 'lucide-react';
import { WidgetData } from '../services/aiCommandService';
import { GeneratedApp } from '../types';

interface WidgetLayerProps {
  widgets: WidgetData[];
  onRemove: (id: string) => void;
  onViewApp?: (app: GeneratedApp) => void;
}

// --- SUB-COMPONENTS ---

const TimerWidget = ({ data }: { data: any }) => {
    const [timeLeft, setTimeLeft] = useState(data.duration);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        let interval: any;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t: number) => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const format = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <div className="text-5xl font-mono font-bold text-white mb-4 tracking-wider">
                {format(timeLeft)}
            </div>
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isRunning ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'}`}
                >
                    {isRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                </button>
                <button 
                    onClick={() => { setIsRunning(false); setTimeLeft(data.initial); }}
                    className="w-12 h-12 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center hover:bg-zinc-700 hover:text-white transition-all"
                >
                    <RotateCcw size={20} />
                </button>
            </div>
        </div>
    );
};

const WeatherWidget = ({ data }: { data: any }) => {
    // Simple WMO code mapping
    const getIcon = (code: number) => {
        if (code === 0) return <Sun size={48} className="text-yellow-400" />;
        if (code <= 3) return <Cloud size={48} className="text-zinc-400" />;
        if (code <= 67) return <CloudRain size={48} className="text-blue-400" />;
        if (code <= 77) return <Snowflake size={48} className="text-cyan-200" />;
        return <Wind size={48} className="text-zinc-500" />;
    };

    return (
        <div className="flex items-center gap-6 w-full">
            <div>{getIcon(data.code)}</div>
            <div>
                <div className="text-4xl font-bold text-white">{data.temp}°</div>
                <div className="text-zinc-400 font-medium text-sm mt-1 uppercase tracking-wide">{data.city}</div>
            </div>
        </div>
    );
};

const BuilderWidget = ({ data, onView }: { data: any, onView?: () => void }) => {
    return (
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4">
                {data.status === 'building' ? (
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-blue-500/30 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 border border-green-500/30">
                        <Check size={20} />
                    </div>
                )}
                <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-white text-sm truncate">
                        {data.status === 'building' ? 'Generating App...' : 'App Ready'}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">
                        "{data.prompt}"
                    </div>
                </div>
            </div>
            
            {data.status === 'ready' ? (
                <button 
                    onClick={onView}
                    className="w-full py-2 bg-white text-black rounded-full font-bold text-xs hover:scale-105 transition-transform"
                >
                    View Project
                </button>
            ) : (
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-1/2 animate-shimmer"></div>
                </div>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

export const WidgetLayer: React.FC<WidgetLayerProps> = ({ widgets, onRemove, onViewApp }) => {
  if (widgets.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4 items-end pointer-events-none">
        {widgets.map(widget => (
            <div 
                key={widget.id} 
                className="pointer-events-auto bg-black border border-zinc-800 rounded-[32px] p-6 shadow-2xl w-72 relative animate-fade-in-up group overflow-hidden"
            >
                {/* Close Button */}
                <button 
                    onClick={() => onRemove(widget.id)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                    <X size={14} />
                </button>

                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />

                {widget.type === 'timer' && <TimerWidget data={widget.data} />}
                {widget.type === 'weather' && <WeatherWidget data={widget.data} />}
                {widget.type === 'builder' && (
                    <BuilderWidget 
                        data={widget.data} 
                        onView={() => {
                            if (widget.data.app && onViewApp) onViewApp(widget.data.app);
                        }} 
                    />
                )}
            </div>
        ))}
    </div>
  );
};
