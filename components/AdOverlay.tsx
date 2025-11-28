
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';

export const AdOverlay: React.FC = () => {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!adRef.current) return;
        
        // Safety check to prevent double injection
        if (adRef.current.hasChildNodes()) return;

        const placeholder = document.createElement('script');
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
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-6"
        >
            <div className="w-full max-w-2xl bg-zinc-900/50 rounded-2xl border border-zinc-800 p-1 overflow-hidden shadow-2xl">
                 {/* Header */}
                 <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <div className="relative">
                             <div className="absolute inset-0 bg-blue-500 blur opacity-50 animate-pulse"></div>
                             <Loader2 size={16} className="text-blue-400 animate-spin relative z-10" />
                         </div>
                         <span className="text-sm font-bold text-white tracking-wide">Generating App...</span>
                     </div>
                     <div className="flex gap-1.5">
                         <div className="w-2 h-2 rounded-full bg-red-500/20"></div>
                         <div className="w-2 h-2 rounded-full bg-yellow-500/20"></div>
                         <div className="w-2 h-2 rounded-full bg-green-500/20"></div>
                     </div>
                 </div>
                 
                 {/* Ad Area */}
                 <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                     {/* Ad Script Container */}
                     <div ref={adRef} className="absolute inset-0 flex items-center justify-center z-10" />
                     
                     {/* Background Animation (if ad takes time to load) */}
                     <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                         <Sparkles className="text-zinc-700 w-16 h-16 animate-pulse" />
                     </div>
                 </div>

                 {/* Footer */}
                 <div className="bg-zinc-900/50 px-4 py-3 flex justify-between items-center text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
                     <span>AI Processing</span>
                     <span>Sponsored Preview</span>
                 </div>
            </div>
            
            <p className="mt-6 text-zinc-500 text-sm animate-pulse font-medium">
                Designing interfaces • Writing code • Configuring database
            </p>
        </motion.div>
    );
};
