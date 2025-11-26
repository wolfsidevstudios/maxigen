import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-white border border-zinc-200 h-full flex flex-col shadow-xl shadow-zinc-200/50 ring-1 ring-black/5">
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
            </div>
            <span className="ml-3 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-wider">App.tsx</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-white rounded-md transition-all text-zinc-400 hover:text-black border border-transparent hover:border-zinc-200 shadow-none hover:shadow-sm"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-white">
        <pre className="text-[12px] md:text-[13px] leading-relaxed font-mono text-zinc-700 whitespace-pre-wrap break-all">
          <style>{`
            .token.comment { color: #a1a1aa; }
            .token.keyword { color: #f43f5e; font-weight: 500; }
            .token.string { color: #059669; }
            .token.function { color: #2563eb; }
          `}</style>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};