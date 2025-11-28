
import React, { useState } from 'react';
import { EdgeFunction } from '../types';
import { Zap, Database, Clock, Play, ArrowRight, Code, Server } from 'lucide-react';
import { motion } from 'framer-motion';

interface EdgeFunctionViewerProps {
  functions: EdgeFunction[];
}

export const EdgeFunctionViewer: React.FC<EdgeFunctionViewerProps> = ({ functions }) => {
  const [selectedFunc, setSelectedFunc] = useState<EdgeFunction | null>(functions[0] || null);

  if (!functions || functions.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-8">
              <Server size={48} className="mb-4 opacity-20" />
              <p className="text-sm text-center">No edge functions generated for this app.</p>
          </div>
      );
  }

  return (
    <div className="h-full flex bg-zinc-50">
        {/* Sidebar List */}
        <div className="w-64 border-r border-zinc-200 bg-white p-4 overflow-y-auto">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Functions</h3>
            <div className="space-y-2">
                {functions.map((func, i) => (
                    <button
                        key={i}
                        onClick={() => setSelectedFunc(func)}
                        className={`w-full text-left p-3 rounded-xl border transition-all ${selectedFunc === func ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            {func.trigger === 'http' && <Zap size={14} className="text-yellow-500" />}
                            {func.trigger === 'schedule' && <Clock size={14} className="text-purple-500" />}
                            {func.trigger === 'db_event' && <Database size={14} className="text-blue-500" />}
                            <span className="font-bold text-sm text-zinc-800 truncate">{func.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-1">{func.description}</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#f8f9fa] flex flex-col">
            {selectedFunc && (
                <div className="absolute inset-0 p-8 flex items-center justify-center">
                    {/* Node Graph Visualization */}
                    <div className="relative w-full max-w-4xl h-96 flex items-center justify-between">
                        {/* Connecting Lines */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                            <path d="M200,192 C350,192 350,192 500,192" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="8 4" className="animate-pulse" />
                            <path d="M700,192 C850,192 850,192 900,192" fill="none" stroke="#cbd5e1" strokeWidth="2" />
                        </svg>

                        {/* Trigger Node */}
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-48 p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 z-10 relative group">
                            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center z-20">
                                <ArrowRight size={12} className="text-zinc-400" />
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-zinc-500 uppercase text-[10px] font-bold tracking-wider">
                                {selectedFunc.trigger === 'http' ? 'HTTP Request' : selectedFunc.trigger === 'schedule' ? 'Cron Job' : 'Database'}
                            </div>
                            <div className="font-bold text-zinc-900">Trigger</div>
                            <div className="text-xs text-zinc-500 mt-1">Starts execution</div>
                        </motion.div>

                        {/* Function Node */}
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="flex-1 mx-16 p-0 bg-[#1e1e1e] rounded-2xl shadow-2xl border border-zinc-800 z-10 overflow-hidden flex flex-col h-64">
                            <div className="bg-[#252526] px-4 py-2 flex items-center gap-2 border-b border-[#333]">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="ml-2 text-xs font-mono text-zinc-400">index.js</span>
                            </div>
                            <div className="flex-1 p-4 overflow-auto custom-scrollbar">
                                <pre className="text-xs font-mono text-blue-300 leading-relaxed">
                                    {selectedFunc.code}
                                </pre>
                            </div>
                        </motion.div>

                        {/* Output Node */}
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="w-48 p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 z-10 relative">
                            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center z-20">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                            </div>
                            <div className="flex items-center gap-2 mb-2 text-green-600 uppercase text-[10px] font-bold tracking-wider">
                                Response
                            </div>
                            <div className="font-bold text-zinc-900">JSON Output</div>
                            <div className="text-xs text-zinc-500 mt-1">200 OK</div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
