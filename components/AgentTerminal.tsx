
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, CheckCircle2, Circle, Cpu, Zap, Code, ShieldCheck, Bug } from 'lucide-react';

interface AgentLog {
  id: string;
  step: 'init' | 'plan' | 'code' | 'review' | 'deploy' | 'qa';
  message: string;
  status: 'pending' | 'active' | 'completed';
}

interface AgentTerminalProps {
  logs: AgentLog[];
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (step: string) => {
    switch(step) {
        case 'init': return <Zap size={14} className="text-yellow-400" />;
        case 'plan': return <Cpu size={14} className="text-purple-400" />;
        case 'code': return <Code size={14} className="text-blue-400" />;
        case 'review': return <ShieldCheck size={14} className="text-green-400" />;
        case 'qa': return <Bug size={14} className="text-red-400" />;
        default: return <Terminal size={14} className="text-zinc-400" />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#09090b] text-zinc-300 font-mono text-sm relative overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="h-10 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0 z-10">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
                </div>
                <span className="ml-3 text-xs font-bold text-zinc-500 flex items-center gap-2">
                    <Cpu size={12} className="text-purple-500" />
                    POWER_CODER_AGENT_v2.0
                </span>
            </div>
            <div className="text-[10px] text-zinc-600 animate-pulse">Processing...</div>
        </div>

        {/* Content */}
        <div className="flex-1 relative p-6 overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-20" />
            
            <div ref={scrollRef} className="relative z-10 h-full overflow-y-auto custom-scrollbar space-y-4 pr-2">
                {logs.map((log) => (
                    <motion.div 
                        key={log.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start gap-3 ${log.status === 'active' ? 'text-white' : log.status === 'completed' ? 'text-zinc-400' : 'text-zinc-600'}`}
                    >
                        <div className={`mt-1 shrink-0 transition-colors duration-500 ${log.status === 'active' ? 'text-blue-400' : log.status === 'completed' ? 'text-green-500' : 'text-zinc-700'}`}>
                            {log.status === 'completed' ? <CheckCircle2 size={16} /> : log.status === 'active' ? <div className="animate-spin"><Circle size={16} style={{ strokeDasharray: "10 20" }} /></div> : <Circle size={16} />}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                                {getIcon(log.step)}
                                <span className="uppercase text-[10px] tracking-wider font-bold opacity-70">{log.step}</span>
                            </div>
                            <p className="leading-relaxed">
                                {log.message}
                                {log.status === 'active' && <span className="inline-block w-1.5 h-4 bg-blue-500 ml-1 align-middle animate-pulse"/>}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>

        {/* Status Bar */}
        <div className="h-8 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 justify-between text-[10px] text-zinc-500 shrink-0 z-10">
            <div className="flex gap-4">
                <span>MEM: 240MB</span>
                <span>CPU: 12%</span>
                <span className="text-green-500">NET: CONNECTED</span>
            </div>
            <div>
                MODE: AGENTIC
            </div>
        </div>
    </div>
  );
};
