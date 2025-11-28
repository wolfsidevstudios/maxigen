
import React from 'react';
import { RotateCw, Lock, ExternalLink, Edit3, ChevronLeft, ChevronRight, Home } from 'lucide-react';

interface BrowserBarProps {
  url: string;
  onReload: () => void;
}

export const BrowserBar: React.FC<BrowserBarProps> = ({ url, onReload }) => {
  const displayUrl = url ? url.replace('https://', '') : 'localhost:3000';

  return (
    <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 gap-4 shrink-0">
        <div className="flex gap-2 text-zinc-400">
            <ChevronLeft size={16} className="cursor-not-allowed opacity-50" />
            <ChevronRight size={16} className="cursor-not-allowed opacity-50" />
            <button onClick={onReload} className="hover:text-black transition-colors">
                <RotateCw size={14} />
            </button>
        </div>

        <div className="flex-1 bg-zinc-100 h-8 rounded-lg flex items-center px-3 gap-2 text-xs text-zinc-600 relative group">
             <Lock size={10} className="text-zinc-400" />
             <span className="font-medium truncate select-all">{displayUrl}</span>
             {!url && <span className="text-zinc-400 italic ml-2">- Preview Mode</span>}
             
             {url && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-100 pl-2">
                    <button 
                        className="p-1 hover:bg-zinc-200 rounded text-zinc-500" 
                        title="Edit URL (Coming Soon)"
                    >
                        <Edit3 size={10} />
                    </button>
                </div>
             )}
        </div>

        <div className="flex gap-3 text-zinc-400">
            {url && (
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-blue-600 transition-colors flex items-center gap-1 text-xs font-medium"
                >
                    <ExternalLink size={14} />
                </a>
            )}
        </div>
    </div>
  );
};
