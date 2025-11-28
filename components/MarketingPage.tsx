
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Smartphone, Globe, Code2, ArrowRight, Layers, Cpu, Rocket, Shield } from 'lucide-react';

interface MarketingPageProps {
  onGetStarted: () => void;
}

export const MarketingPage: React.FC<MarketingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                    <Zap size={24} className="text-black fill-black" />
                </div>
                <span className="text-xl font-bold tracking-tight">MaxiGen</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                <a href="#features" className="hover:text-white transition-colors">Features</a>
                <a href="#showcase" className="hover:text-white transition-colors">Showcase</a>
                <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            </div>
            <button 
                onClick={onGetStarted}
                className="bg-white text-black px-6 py-2.5 rounded-full text-sm font-bold hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                Get Started
            </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] opacity-30 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] opacity-20 pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="inline-block py-1 px-3 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-6">
                    <span className="text-purple-400 mr-2">●</span> v2.0 Now Available
                </span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                    Build Production Apps <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                        At The Speed of Thought
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                    Generate multi-file React & Native applications with one prompt. 
                    Integrated with Firebase, RevenueCat, and Vercel.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button 
                        onClick={onGetStarted}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] transition-all overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Start Building Free <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-200 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all">
                        View Showcase
                    </button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Interface Mockup Animation */}
      <section className="px-4 mb-32">
        <motion.div 
            initial={{ opacity: 0, y: 40, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1, type: "spring" }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto rounded-[32px] border border-white/10 bg-[#0a0a0a] shadow-2xl shadow-purple-900/20 overflow-hidden relative"
        >
            <div className="h-12 bg-zinc-900/50 border-b border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="relative aspect-[16/9] bg-gradient-to-br from-zinc-900 to-black p-8 flex gap-8">
                {/* Simulated Sidebar */}
                <div className="w-64 h-full rounded-xl bg-white/5 border border-white/5 p-4 flex flex-col gap-3">
                    <div className="h-8 w-24 bg-white/10 rounded-lg mb-4" />
                    {[1,2,3,4].map(i => (
                        <div key={i} className="h-10 w-full bg-white/5 rounded-lg" />
                    ))}
                </div>
                {/* Simulated Canvas */}
                <div className="flex-1 h-full rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-white/[0.02]" />
                    <motion.div 
                        animate={{ scale: [0.95, 1, 0.95] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[300px] h-[500px] bg-black border border-zinc-700 rounded-[32px] shadow-2xl flex flex-col overflow-hidden"
                    >
                        <div className="h-14 bg-zinc-900 border-b border-zinc-800" />
                        <div className="flex-1 bg-zinc-950 p-4 space-y-4">
                            <div className="h-32 rounded-2xl bg-zinc-800 animate-pulse" />
                            <div className="h-8 w-2/3 rounded-lg bg-zinc-800" />
                            <div className="h-4 w-1/2 rounded-lg bg-zinc-800" />
                            <div className="flex gap-2 mt-4">
                                <div className="h-10 flex-1 rounded-lg bg-purple-600/50" />
                                <div className="h-10 flex-1 rounded-lg bg-zinc-800" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Modern Engineering</h2>
            <p className="text-zinc-400 max-w-2xl text-lg">MaxiGen isn't just a UI generator. It writes production-grade code, handles database connections, and deploys to the edge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Feature 1: Multi-file */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-2 rounded-[32px] bg-zinc-900/50 border border-white/10 p-8 flex flex-col relative overflow-hidden group"
            >
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Code2 size={120} />
                </div>
                <div className="relative z-10 mt-auto">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                        <Layers size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Multi-file Architecture</h3>
                    <p className="text-zinc-400">Generates separate files for Components, Hooks, and Styles. No more spaghetti code.</p>
                </div>
            </motion.div>

            {/* Feature 2: Mobile & Web */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-[32px] bg-zinc-900/50 border border-white/10 p-8 flex flex-col relative overflow-hidden"
            >
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl" />
                <div className="mt-auto">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                        <Smartphone size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">React Native & Web</h3>
                    <p className="text-zinc-400">One prompt, two platforms. Export to Expo or Vite.</p>
                </div>
            </motion.div>

            {/* Feature 3: Integrations */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="rounded-[32px] bg-zinc-900/50 border border-white/10 p-8 flex flex-col relative overflow-hidden"
            >
                <div className="mt-auto">
                    <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 text-green-400">
                        <Cpu size={24} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pre-built Integrations</h3>
                    <p className="text-zinc-400">Connect RevenueCat, Firebase, and Supabase in one click.</p>
                </div>
            </motion.div>

            {/* Feature 4: Deployment */}
            <motion.div 
                whileHover={{ scale: 1.02 }}
                className="md:col-span-2 rounded-[32px] bg-zinc-900/50 border border-white/10 p-8 flex flex-col relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-900 z-0" />
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                
                <div className="relative z-10 mt-auto flex items-end justify-between">
                    <div>
                        <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-4 text-orange-400">
                            <Rocket size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Instant Deployment</h3>
                        <p className="text-zinc-400">Deploy your generated web apps directly to Vercel.</p>
                    </div>
                    <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hidden md:block group-hover:scale-105 transition-transform">
                        Deploy Now
                    </button>
                </div>
            </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Zap size={20} className="text-white fill-white" />
                <span className="font-bold text-lg">MaxiGen</span>
            </div>
            <p className="text-zinc-500 text-sm">© 2025 MaxiGen AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
