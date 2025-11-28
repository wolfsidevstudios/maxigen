
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Globe, Code2, Plus, Database, Cpu, Server, Link as LinkIcon, Key, ExternalLink, ChevronDown } from 'lucide-react';
import { BROWSER_APIS, PUBLIC_APIS, MCP_INTEGRATIONS, CONNECTED_APPS, Integration } from '../services/integrationsService';

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (integration: Integration, apiKey?: string, customOption?: string) => void;
}

export const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'browser' | 'public' | 'mcp' | 'connected'>('public');
  const [query, setQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<Integration | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  if (!isOpen) return null;

  const getList = () => {
      if (activeTab === 'browser') return BROWSER_APIS;
      if (activeTab === 'mcp') return MCP_INTEGRATIONS;
      if (activeTab === 'connected') return CONNECTED_APPS;
      return PUBLIC_APIS;
  }

  const currentList = getList();
  const filteredList = currentList.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddClick = (item: Integration) => {
      if (item.requiresKey) {
          setSelectedApp(item);
          setApiKey('');
          if (item.options && item.options.length > 0) {
              setSelectedOption(item.options[0].value);
          } else {
              setSelectedOption('');
          }
      } else {
          onAdd(item);
      }
  };

  const confirmApiKey = () => {
      if (selectedApp && apiKey) {
          onAdd(selectedApp, apiKey, selectedOption);
          setSelectedApp(null);
      }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-4xl bg-zinc-900 rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-zinc-800"
      >
        {/* Header */}
        <div className="bg-zinc-900 px-8 py-6 border-b border-zinc-800 flex items-center justify-between sticky top-0 z-10">
            <div>
                <h2 className="text-2xl font-bold text-white">Add Integration</h2>
                <p className="text-zinc-400 text-sm mt-1">Supercharge your app with ready-to-use APIs and functionality.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Tabs & Search */}
        <div className="px-8 py-6 flex flex-col md:flex-row gap-4 justify-between items-center bg-zinc-950/50">
            <div className="flex bg-zinc-900 p-1 rounded-xl shadow-sm border border-zinc-800 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setActiveTab('public')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'public' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                >
                    <Database size={16} /> Public Datasets
                </button>
                <button 
                    onClick={() => setActiveTab('browser')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'browser' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                >
                    <Cpu size={16} /> Browser APIs
                </button>
                <button 
                    onClick={() => setActiveTab('mcp')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'mcp' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                >
                    <Server size={16} /> MCP Servers
                </button>
                <button 
                    onClick={() => setActiveTab('connected')}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'connected' ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}
                >
                    <LinkIcon size={16} /> Connect Apps
                </button>
            </div>

            <div className="relative w-full md:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search APIs..."
                    className="w-full pl-9 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/10 text-white"
                />
            </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-8 pt-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 custom-scrollbar relative">
            {filteredList.map(item => (
                <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl hover:shadow-lg hover:border-zinc-700 transition-all group flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${
                            item.category === 'public_api' ? 'bg-blue-900/30 text-blue-400' : 
                            item.category === 'browser' ? 'bg-purple-900/30 text-purple-400' :
                            item.category === 'mcp' ? 'bg-amber-900/30 text-amber-400' :
                            'bg-green-900/30 text-green-400'
                        }`}>
                            {item.category === 'public_api' && <Globe size={20} />}
                            {item.category === 'browser' && <Code2 size={20} />}
                            {item.category === 'mcp' && <Server size={20} />}
                            {item.category === 'connected_app' && <LinkIcon size={20} />}
                        </div>
                    </div>
                    
                    <h3 className="font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-zinc-400 text-xs mb-4 line-clamp-2 leading-relaxed flex-1">{item.description}</p>
                    
                    <button 
                        onClick={() => handleAddClick(item)}
                        className="w-full py-2.5 bg-zinc-950 hover:bg-white hover:text-black border border-zinc-800 hover:border-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 mt-auto text-zinc-300"
                    >
                        <Plus size={14} /> {item.requiresKey ? 'Connect' : 'Add to Prompt'}
                    </button>
                </div>
            ))}
            
            {filteredList.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 flex flex-col items-center">
                    <Search size={48} className="mb-4 opacity-20" />
                    <p>No integrations found matching "{query}"</p>
                </div>
            )}

            {/* API Key Modal Overlay - Compact Pill Bar */}
            <AnimatePresence>
                {selectedApp && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedApp(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-2xl"
                        >
                            <div className="shimmer-input-wrapper shadow-2xl">
                                <div className="shimmer-input-content p-2 flex items-center gap-2">
                                    
                                    {/* App Label */}
                                    <div className="pl-4 pr-3 flex items-center gap-2 text-white font-bold whitespace-nowrap border-r border-white/10 shrink-0 h-8">
                                        <Key size={16} className="text-zinc-400" />
                                        <span className="hidden sm:inline">{selectedApp.name}</span>
                                    </div>

                                    {/* Model Selector (if options exist) */}
                                    {selectedApp.options && selectedApp.options.length > 0 && (
                                         <div className="relative border-r border-white/10 pr-2 mr-2">
                                            <select 
                                                value={selectedOption}
                                                onChange={e => setSelectedOption(e.target.value)}
                                                className="bg-transparent text-sm text-zinc-300 outline-none border-none cursor-pointer hover:text-white appearance-none py-1 pl-2 pr-6"
                                            >
                                                {selectedApp.options.map(opt => (
                                                    <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">{opt.label}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                                         </div>
                                    )}
                                    
                                    {/* Key Input */}
                                    <input 
                                        type="password" 
                                        autoFocus
                                        value={apiKey}
                                        onChange={e => setApiKey(e.target.value)}
                                        placeholder={`Paste ${selectedApp.name} API Key...`}
                                        className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-zinc-600 h-10 min-w-[100px] text-sm"
                                    />

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pr-1">
                                        {selectedApp.keyUrl && (
                                            <a href={selectedApp.keyUrl} target="_blank" rel="noreferrer" className="p-2 text-zinc-500 hover:text-blue-400 transition-colors" title="Get API Key">
                                                <ExternalLink size={16} />
                                            </a>
                                        )}
                                        <button 
                                            onClick={confirmApiKey}
                                            disabled={!apiKey}
                                            className="h-9 px-5 bg-white hover:bg-zinc-200 text-black rounded-full font-bold text-sm transition-all shadow-lg shadow-white/10 active:scale-95 disabled:opacity-30 disabled:shadow-none whitespace-nowrap"
                                        >
                                            Connect
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Cancel Button */}
                            <div className="text-center mt-6">
                                <button onClick={() => setSelectedApp(null)} className="text-xs text-zinc-500 hover:text-white transition-colors bg-black/20 px-3 py-1 rounded-full">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
