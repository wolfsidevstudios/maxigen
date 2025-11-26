
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, Globe, Code2, Plus, Database, Cpu } from 'lucide-react';
import { BROWSER_APIS, PUBLIC_APIS, Integration } from '../services/integrationsService';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (integration: Integration) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'browser' | 'public'>('public');
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const currentList = activeTab === 'browser' ? BROWSER_APIS : PUBLIC_APIS;
  const filteredList = currentList.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-zinc-50 rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl"
      >
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-10">
            <div>
                <h2 className="text-2xl font-bold text-zinc-900">Add Integration</h2>
                <p className="text-zinc-500 text-sm mt-1">Supercharge your app with ready-to-use APIs and functionality.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full text-zinc-400 hover:text-zinc-600 transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs & Search */}
        <div className="px-8 py-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-50/50">
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-zinc-200">
                <button 
                    onClick={() => setActiveTab('public')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'public' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                    <Database size={16} /> Public Datasets
                    <span className="bg-zinc-700/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{PUBLIC_APIS.length}</span>
                </button>
                <button 
                    onClick={() => setActiveTab('browser')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === 'browser' ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-50'}`}
                >
                    <Cpu size={16} /> Browser APIs
                    <span className="bg-zinc-700/20 px-1.5 py-0.5 rounded text-[10px] ml-1">{BROWSER_APIS.length}</span>
                </button>
            </div>

            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search APIs..."
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black/5"
                />
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar">
            {filteredList.map(item => (
                <div key={item.id} className="bg-white border border-zinc-200 p-5 rounded-2xl hover:shadow-lg hover:border-zinc-300 transition-all group flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${activeTab === 'public' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                            {activeTab === 'public' ? <Globe size={20} /> : <Code2 size={20} />}
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-zinc-900 mb-1">{item.name}</h3>
                    <p className="text-zinc-500 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                    
                    <button 
                        onClick={() => onAdd(item)}
                        className="w-full py-2.5 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 hover:border-black rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 mt-auto"
                    >
                        <Plus size={14} /> Add to Prompt
                    </button>
                </div>
            ))}
            
            {filteredList.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-400 flex flex-col items-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>No integrations found matching "{query}"</p>
                </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};
