
import React, { useState } from 'react';
import { Copy, Check, File, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { ProjectFile } from '../types';

interface CodeViewerProps {
  code: string;
  files?: ProjectFile[];
  language: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, files, language }) => {
  const [copied, setCopied] = useState(false);
  // Default to first file if available, otherwise use raw code prop
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(files && files.length > 0 ? files[0] : null);
  
  // If no files provided, fall back to simple view
  const displayCode = selectedFile ? selectedFile.content : code;
  const displayPath = selectedFile ? selectedFile.path : 'src/App.tsx';

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden bg-[#1e1e1e] border border-zinc-800 h-full flex shadow-xl shadow-black/50">
      
      {/* File Explorer Sidebar (Only if files exist) */}
      {files && files.length > 0 && (
          <div className="w-48 bg-[#252526] border-r border-[#333] flex flex-col">
              <div className="px-4 py-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Explorer</div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="px-2">
                      <div className="flex items-center gap-1 text-zinc-400 py-1 text-xs">
                          <ChevronDown size={12} />
                          <Folder size={12} className="text-blue-400" />
                          <span className="font-bold">src</span>
                      </div>
                      <div className="pl-4 flex flex-col gap-0.5">
                          {files.map((file, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedFile(file)}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left truncate transition-colors ${selectedFile?.path === file.path ? 'bg-[#37373d] text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#2a2d2e]'}`}
                              >
                                  <File size={12} className={getFileIconColor(file.path)} />
                                  <span className="truncate">{file.path.split('/').pop()}</span>
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Code Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#333]">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></div>
                </div>
                <span className="text-[12px] font-mono text-zinc-400">{displayPath}</span>
            </div>
            <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-[#333] rounded-md transition-all text-zinc-400 hover:text-white"
            title="Copy to clipboard"
            >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        </div>
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#1e1e1e]">
            <pre className="text-[12px] md:text-[13px] leading-relaxed font-mono text-[#d4d4d4] whitespace-pre-wrap break-all">
            <style>{`
                .token.comment { color: #6a9955; }
                .token.keyword { color: #569cd6; font-weight: bold; }
                .token.string { color: #ce9178; }
                .token.function { color: #dcdcaa; }
                .token.tag { color: #569cd6; }
            `}</style>
            <code>{displayCode}</code>
            </pre>
        </div>
      </div>
    </div>
  );
};

// Helper for file icons
function getFileIconColor(path: string) {
    if (path.endsWith('tsx') || path.endsWith('jsx')) return 'text-blue-400';
    if (path.endsWith('ts') || path.endsWith('js')) return 'text-yellow-400';
    if (path.endsWith('css')) return 'text-cyan-400';
    if (path.endsWith('json')) return 'text-orange-400';
    return 'text-zinc-400';
}
