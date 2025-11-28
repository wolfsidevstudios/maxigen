
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export const AdOverlay: React.FC = () => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adRef.current) return;
        
        // Safety check to prevent double injection
        if (adRef.current.hasChildNodes()) return;

        // Create a placeholder element to anchor the script injection
        const placeholder = document.createElement('div');
        placeholder.id = "ad-placeholder";
        adRef.current.appendChild(placeholder);

        try {
            (function(n){
                var d = document,
                    s = d.createElement('script'),
                    l = placeholder; 
                (s as any).settings = n || {};
                s.src = "\/\/ornery-possible.com\/b\/XcVpsVd.G\/lw0LYNWqcP\/peEmQ9guQZZU\/likpPzTCYn3mMRTRYRwgM\/DtE-twNbjGc_x\/NrjRAnwoMug-";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                if (l.parentNode) {
                    l.parentNode.insertBefore(s, l);
                }
            })({});
        } catch(e) {
            console.error("Ad Error", e);
        }
        
        return () => {
            // Cleanup handled by React unmounting the parent div usually
        };
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6"
        >
            <div className="w-full max-w-2xl bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl relative">
                 {/* Header */}
                 <div className="bg-zinc-950 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="relative flex items-center justify-center w-8 h-8">
                             <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 animate-pulse"></div>
                             <Loader2 size={20} className="text-blue-400 animate-spin relative z-10" />
                         </div>
                         <div>
                             <h3 className="text-sm font-bold text-white tracking-wide">Building your App</h3>
                             <p className="text-xs text-zinc-500">This may take a few seconds...</p>
                         </div>
                     </div>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
                         <Sparkles size={12} className="text-purple-400" />
                         <span className="text-[10px] font-medium text-zinc-400">AI Processing</span>
                     </div>
                 </div>

                 {/* Ad Container */}
                 <div className="p-8 flex flex-col items-center justify-center bg-black min-h-[300px]">
                     <div ref={adRef} className="w-full h-full flex items-center justify-center text-zinc-700 text-sm">
                         {/* Script injects here */}
                     </div>
                 </div>
                 
                 {/* Footer */}
                 <div className="bg-zinc-950 px-6 py-3 border-t border-zinc-800 text-center">
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Sponsored Content</p>
                 </div>
            </div>
        </motion.div>
    );
};
