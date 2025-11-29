
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, Keyboard, ArrowUp, Sparkles } from 'lucide-react';
import { speechToText } from '../services/speechService';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (text: string) => Promise<void>;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, onCommand }) => {
  const [mode, setMode] = useState<'voice' | 'type'>('voice');
  const [transcript, setTranscript] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef(''); 

  // Sync ref for closure access
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  // Handle Lifecycle
  useEffect(() => {
    if (isOpen) {
        setIsProcessing(false);
        if (mode === 'voice') {
            startListening();
        } else {
            // Focus input if in type mode? (Handled by autoFocus on input)
        }
    } else {
        stopListening();
        setTranscript("");
        setInputValue("");
    }
    // Cleanup on unmount
    return () => stopListening();
  }, [isOpen]);

  // Handle Mode Switch
  useEffect(() => {
      if (!isOpen) return;
      
      if (mode === 'voice') {
          startListening();
      } else {
          stopListening();
          setTranscript("");
      }
  }, [mode]);

  const startListening = () => {
      stopListening();
      setTranscript("Listening...");
      transcriptRef.current = "Listening..."; // Reset ref immediately
      
      recognitionRef.current = speechToText.start(
          (text) => {
              setTranscript(text);
          },
          () => {
              // Auto-submit on silence
              const currentText = transcriptRef.current;
              // Check isProcessing to avoid double submission
              // Check mode to ensure we are still in voice mode
              if (currentText && currentText !== "Listening..." && !isProcessing && mode === 'voice') {
                  handleCommand(currentText);
              }
          }
      );
  };

  const stopListening = () => {
      if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch(e) { /* ignore */ }
          recognitionRef.current = null;
      }
  };

  const handleCommand = async (text: string) => {
      if (isProcessing || !text.trim()) return;
      setIsProcessing(true);
      stopListening();
      
      await onCommand(text);
      
      setTimeout(() => {
          onClose();
          setIsProcessing(false);
          setTranscript("");
          setInputValue("");
      }, 1000);
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCommand(inputValue);
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

          {/* Mode Switcher */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-zinc-900/80 backdrop-blur-md p-1 rounded-full border border-zinc-700 flex gap-1 z-50 shadow-lg">
             <button 
                onClick={() => setMode('voice')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode==='voice' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
             >
                 <Mic size={14} /> Voice
             </button>
             <button 
                onClick={() => setMode('type')} 
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode==='type' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'}`}
             >
                 <Keyboard size={14} /> Type
             </button>
          </div>

          {/* Content */}
          <div className="relative z-40 flex flex-col items-center justify-center w-full max-w-3xl px-6 text-center">
            
            {/* VOICE MODE UI */}
            {mode === 'voice' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex flex-col items-center"
                >
                    {/* Siri-like Orb Animation */}
                    <div className="relative w-40 h-40 mb-12 flex items-center justify-center">
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute w-20 h-20 bg-white rounded-full blur-xl"
                        />
                        <motion.div 
                            animate={{ scale: [1, 1.5, 1], rotate: [0, 180, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute w-24 h-24 bg-cyan-500/50 rounded-full blur-2xl mix-blend-screen"
                        />
                        <motion.div 
                            animate={{ scale: [1.2, 1, 1.2], rotate: [0, -180, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute w-28 h-28 bg-purple-500/50 rounded-full blur-2xl mix-blend-screen translate-x-2"
                        />
                        <motion.div 
                            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 0.8, 0.5] }}
                            transition={{ duration: 2.5, repeat: Infinity }}
                            className="absolute w-32 h-32 bg-pink-500/40 rounded-full blur-3xl mix-blend-screen -translate-y-2"
                        />
                    </div>

                    <motion.h2 
                        key={transcript}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 drop-shadow-2xl tracking-tight max-w-2xl leading-tight min-h-[80px]"
                    >
                        "{transcript}"
                    </motion.h2>
                </motion.div>
            )}

            {/* TYPE MODE UI */}
            {mode === 'type' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="w-full max-w-xl"
                >
                    <div className="mb-8 flex justify-center">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 flex items-center justify-center shadow-2xl">
                            <Sparkles size={40} className="text-white fill-white" />
                        </div>
                    </div>
                    
                    <form onSubmit={handleTypeSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-20 group-focus-within:opacity-40 transition-opacity"></div>
                        <div className="relative flex items-center">
                            <input 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="What can I do for you?"
                                autoFocus
                                className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-full px-8 py-5 text-xl text-white placeholder:text-zinc-600 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all shadow-2xl"
                            />
                            <button 
                                type="submit"
                                disabled={!inputValue.trim()}
                                className="absolute right-2 p-3 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-0 disabled:scale-90 transition-all shadow-lg active:scale-95"
                            >
                                <ArrowUp size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                    </form>
                    <p className="mt-4 text-zinc-500 text-sm font-medium">Ask to build apps, set timers, or check weather.</p>
                </motion.div>
            )}

            {isProcessing && (
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-32 text-zinc-400 text-sm font-mono uppercase tracking-widest"
                >
                    Processing...
                </motion.p>
            )}

          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute bottom-10 p-4 bg-zinc-900/50 text-zinc-400 rounded-full hover:bg-zinc-800 hover:text-white transition-all backdrop-blur-md border border-white/10 pointer-events-auto z-50"
          >
            <X size={24} />
          </button>

        </motion.div>
      )}
    </AnimatePresence>
  );
};
