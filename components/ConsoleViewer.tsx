
import React from 'react';
import { Terminal, AlertCircle, Info, CheckCircle2, Trash2 } from 'lucide-react';

interface Log {
    type: 'info' | 'warn' | 'error' | 'success' | 'system';
    msg: string;
}

interface ConsoleViewerProps {
    logs?: Log[];
    onClear?: () => void;
}

export const ConsoleViewer: React.FC<ConsoleViewerProps> = ({ logs = [], onClear }) => {
  return (
    <div className="h-full w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
            <div className="flex items-center gap-2">
                <Terminal size={12} className="text-zinc-400" />
                <span className="font-semibold text-zinc-300">Terminal</span>
            </div>
            <div className="flex gap-2 items-center">
                {onClear && (
                    <button onClick={onClear} className="p-1 hover:bg-[#333] rounded text-zinc-500 hover:text-white transition-colors" title="Clear Console">
                        <Trash2 size={12} />
                    </button>
                )}
                <div className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Output</div>
            </div>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-1.5 custom-scrollbar">
            {logs.length === 0 && (
                <div className="text-zinc-600 italic">Waiting for logs...</div>
            )}
            {logs.map((log, i) => (
                <div key={i} className="flex gap-3 animate-fade-in">
                    <span className="text-zinc-600 select-none shrink-0 w-16 text-right">
                        {new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </span>
                    <div className="flex-1 break-all flex gap-2">
                        {log.type === 'success' && <CheckCircle2 size={12} className="mt-0.5 text-green-500 shrink-0" />}
                        {log.type === 'warn' && <AlertCircle size={12} className="mt-0.5 text-yellow-500 shrink-0" />}
                        {log.type === 'info' && <Info size={12} className="mt-0.5 text-blue-500 shrink-0" />}
                        {log.type === 'error' && <AlertCircle size={12} className="mt-0.5 text-red-500 shrink-0" />}
                        
                        <span className={`
                            ${log.type === 'success' ? 'text-green-400' : ''}
                            ${log.type === 'warn' ? 'text-yellow-400' : ''}
                            ${log.type === 'error' ? 'text-red-400' : ''}
                            ${log.type === 'system' ? 'text-zinc-500 italic' : ''}
                        `}>
                            {log.msg}
                        </span>
                    </div>
                </div>
            ))}
            <div className="flex gap-2 mt-4 animate-pulse opacity-50">
                <span className="text-zinc-500 w-16 text-right">~</span>
                <span className="text-zinc-400">➜</span>
                <span className="w-2 h-4 bg-zinc-500 block"></span>
            </div>
        </div>
    </div>
  );
};
