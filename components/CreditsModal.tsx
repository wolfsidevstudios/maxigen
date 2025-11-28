
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Loader2, PlayCircle } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose, onReward }) => {
  const [watching, setWatching] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  const handleWatchAd = () => {
    setWatching(true);
    
    // Inject the ad script (Pop under behavior)
    if (adRef.current) {
        // Clear previous if any
        while(adRef.current.firstChild) {
            adRef.current.removeChild(adRef.current.firstChild);
        }

        const script = document.createElement('script');
        script.src = "//ornery-possible.com/b/XcVpsVd.G/lw0LYNWqcP/peEmQ9guQZZU/likpPzTCYn3mMRTRYRwgM/DtE-twNbjGc_x/NrjRAnwoMug-";
        script.async = true;
        (script as any).settings = {};
        script.referrerPolicy = 'no-referrer-when-downgrade';
        adRef.current.appendChild(script);
    }

    // Simulate ad completion / verification
    setTimeout(() => {
        onReward();
        setWatching(false);
        onClose();
    }, 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden"
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors z-10"
        >
            <X size={20} />
        </button>

        <div className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap size={32} className="text-yellow-500 fill-yellow-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Out of Credits</h2>
            <p className="text-zinc-400 mb-8">
                You need credits to generate new apps. Watch a short ad to earn free credits instantly.
            </p>

            {watching ? (
                 <div className="w-full py-4 bg-zinc-800 rounded-xl flex items-center justify-center gap-3 text-zinc-300 mb-4">
                     <Loader2 size={20} className="animate-spin" />
                     <span>Verifying ad view...</span>
                 </div>
            ) : (
                <button 
                    onClick={handleWatchAd}
                    className="w-full py-4 bg-white hover:bg-zinc-200 text-black rounded-xl font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <PlayCircle size={20} />
                    Watch Ad for +3 Credits
                </button>
            )}
            
            <div className="mt-6 text-xs text-zinc-600">
                Pop-under ad will appear. Please allow popups if blocked.
            </div>
        </div>
        
        {/* Hidden Container for Ad Script */}
        <div ref={adRef} className="hidden"></div>
      </motion.div>
    </div>
  );
};
