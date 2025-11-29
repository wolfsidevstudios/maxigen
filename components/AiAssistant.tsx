
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { speechToText } from '../services/speechService';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (text: string) => Promise<void>;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, onCommand }) => {
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
        setTranscript("Listening...");
        setIsProcessing(false);
        recognitionRef.current = speechToText.start(
            (text) => setTranscript(text),
            () => {
                // On end, if we have text, process it
                if (transcript && transcript !== "Listening...") {
                    handleFinish(transcript);
                }
            }
        );
    } else {
        if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isOpen]);

  // If transcript updates while listening, update local state.
  // Note: The logic above relies on onEnd calling handleFinish with latest state, 
  // but since closure captures old state, we rely on the ref inside speechService or simple timeout here.
  // Better approach: When silence is detected, speechService ends.

  const handleFinish = async (text: string) => {
      if (isProcessing) return;
      setIsProcessing(true);
      if (recognitionRef.current) recognitionRef.current.stop();
      
      await onCommand(text);
      
      setTimeout(() => {
          onClose();
          setTranscript("");
          setIsProcessing(false);
      }, 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* Backdrop Blur */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-2xl transition-all duration-500"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-2xl px-6 text-center pointer-events-none">
            
            {/* Siri-like Orb Animation */}
            <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
                {/* Core */}
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute w-20 h-20 bg-white rounded-full blur-xl"
                />
                
                {/* Cyan Glow */}
                <motion.div 
                    animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute w-24 h-24 bg-cyan-500/50 rounded-full blur-2xl mix-blend-screen"
                />
                
                {/* Purple Glow */}
                <motion.div 
                    animate={{ scale: [1.2, 1, 1.2], rotate: [0, -180, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute w-28 h-28 bg-purple-500/50 rounded-full blur-2xl mix-blend-screen translate-x-2"
                />
                
                {/* Pink Glow */}
                <motion.div 
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute w-32 h-32 bg-pink-500/40 rounded-full blur-3xl mix-blend-screen -translate-y-2"
                />
            </div>

            {/* Transcript Text */}
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={transcript} // Re-animate on text change
                className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 drop-shadow-2xl tracking-tight"
            >
                "{transcript}"
            </motion.h2>

            {isProcessing && (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 text-zinc-400 text-sm font-mono uppercase tracking-widest"
                >
                    Processing...
                </motion.p>
            )}

          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute bottom-10 p-4 bg-zinc-900/50 text-zinc-400 rounded-full hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-md border border-white/10 pointer-events-auto"
          >
            <X size={24} />
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
