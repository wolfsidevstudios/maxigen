import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles, Zap, Smartphone, Globe, Code2, ArrowRight, Layers, Cpu, Rocket, Shield, CheckCircle2, Terminal, Database, Play, DollarSign, Users, Timer, Star } from 'lucide-react';

const NetlifyIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" className="w-full h-full"><g transform="translate(9.167 9.167) scale(11.5703)"><clipPath id="prefix__a"><path d="M0 0h42.667v42.667H0z"/></clipPath><g clipPath="url(#prefix__a)"><path d="M23.99 24.43h-5.317l-.44-.44v-5.317l.44-.44h5.316l.442.44v5.316l-.442.442z" fill="#014847" fillRule="nonzero"/><g fill="#05bdba" fillRule="nonzero"><path d="M12.928 32.441h-.452l-2.255-2.254v-.448l3.447-3.451 2.388.004.319.315v2.388l-3.447 3.446zM10.221 12.928v-.452l2.255-2.255h.452l3.447 3.447v2.384l-.319.323h-2.388l-3.447-3.447zM13.395 23.25H.273L0 22.974v-3.287l.273-.275h13.122l.273.275v3.287l-.273.274zM42.393 23.25H29.272l-.273-.275v-3.287l.273-.275h13.121l.274.275v3.287l-.274.274zM19.417 13.395V3.553l.275-.273h3.287l.274.273v9.842l-.274.273h-3.287l-.275-.273zM19.417 39.11v-9.84l.275-.275h3.287l.274.274v9.84l-.274.274h-3.287l-.275-.274z"/></g></g></g></svg>
);

interface MarketingPageProps {
  onGetStarted: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export const MarketingPage: React.FC<MarketingPageProps> = ({ onGetStarted }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!adRef.current) return;
      
      // Clear any existing children to avoid duplicates if re-mounting
      while(adRef.current.firstChild) {
          adRef.current.removeChild(adRef.current.firstChild);
      }

      const anchorA = document.createElement('div');
      anchorA.id = "ad-anchor-a";
      adRef.current.appendChild(anchorA);

      const anchorB = document.createElement('div');
      anchorB.id = "ad-anchor-b";
      adRef.current.appendChild(anchorB);

      // Ad Script 1 (Display)
      try {
          (function(sitsij){
              var d = document,
                  s = d.createElement('script'),
                  l = anchorA;
              (s as any).settings = sitsij || {};
              s.src = "\/\/ornery-possible.com\/bhXFV.sYdOGDlL0UY\/WJcc\/jeHm-9YuCZDUxlckrPITHYa3FMsTCYTwdMqTxMOt\/NDjrc\/xJNnjqApx\/N_Aj";
              s.async = true;
              s.referrerPolicy = 'no-referrer-when-downgrade';
              if (l.parentNode) {
                  l.parentNode.insertBefore(s, l);
              }
          })({});
      } catch (e) {
          console.error("Ad 1 Error", e);
      }

      // Ad Script 2 (Video)
      try {
           (function(n){
                var d = document,
                    s = d.createElement('script'),
                    l = anchorB;
                (s as any).settings = n || {};
                s.src = "https://querulousbread.com/dfmRF.zpdqGENbvEZzGOUw/Ye/mB9/uRZbUplWkuP/T/YP3lM/T/YjwzMPT/cKt/N/j/cNx/NcjqA/xfOSAq";
                s.async = true;
                s.referrerPolicy = 'no-referrer-when-downgrade';
                if (l.parentNode) {
                    l.parentNode.insertBefore(s, l);
                }
            })({});
      } catch(e) {
          console.error("Ad 2 Error", e);
      }

  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* Ad Container (Hidden but present for script injection) */}
      <div ref={adRef} className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none" />

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
                <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
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

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-screen flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] opacity-30 pointer-events-none animate-pulse" />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400 mb-8 hover:border-purple-500/50 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    AI-Powered App Builder v2.0
                </div>
                
                <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
                    Build Apps at <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-purple-400">
                        Light Speed
                    </span>
                </h1>
                
                <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                    Transform text into production-ready React applications. 
                    Integrated authentication, database, and payments included.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <button 
                        onClick={onGetStarted}
                        className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] transition-all overflow-hidden w-full sm:w-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            Start Building <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                        </span>
                    </button>
                    <button className="px-8 py-4 bg-zinc-900 text-white border border-zinc-800 rounded-full font-bold text-lg hover:bg-zinc-800 transition-all w-full sm:w-auto">
                        Watch Demo
                    </button>
                </div>

                {/* Simulated UI Card */}
                <motion.div 
                    initial={{ opacity: 0, rotateX: 20, y: 100 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    transition={{ delay: 0.4, duration: 1, type: "spring" }}
                    className="relative mx-auto max-w-5xl rounded-[24px] border border-white/10 bg-zinc-900/50 backdrop-blur-xl shadow-2xl overflow-hidden"
                >
                    <div className="h-12 bg-zinc-900 border-b border-white/5 flex items-center px-4 gap-2">
                         <div className="flex gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-500/20" />
                             <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                             <div className="w-3 h-3 rounded-full bg-green-500/20" />
                         </div>
                    </div>
                    <div className="aspect-[16/9] bg-black/50 p-8 flex items-center justify-center">
                        <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
                             <div className="space-y-4">
                                 <div className="h-32 bg-zinc-800/50 rounded-xl animate-pulse" />
                                 <div className="h-8 bg-zinc-800/50 rounded-lg w-3/4" />
                                 <div className="h-4 bg-zinc-800/50 rounded-lg w-1/2" />
                             </div>
                             <div className="space-y-4 pt-8">
                                 <div className="h-8 bg-zinc-800/50 rounded-lg w-full" />
                                 <div className="h-32 bg-zinc-800/50 rounded-xl" />
                                 <div className="h-8 bg-purple-500/20 rounded-lg w-1/3" />
                             </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* 2. LOGO TICKER SECTION */}
      <section className="py-10 border-y border-white/5 bg-black/50">
          <div className="max-w-7xl mx-auto px-6 overflow-hidden">
              <p className="text-center text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-8">Trusted by innovators at</p>
              <div className="flex relative w-full overflow-hidden mask-gradient">
                  <motion.div 
                      className="flex gap-16 min-w-full items-center justify-around whitespace-nowrap"
                      animate={{ x: "-100%" }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                      {["Acme Corp", "Global Bank", "TechStart", "Future AI", "Nebula", "Orbit", "Quantum", "Hyperion", "Vertex"].map((logo, i) => (
                          <span key={i} className="text-2xl font-bold text-zinc-700">{logo}</span>
                      ))}
                      {["Acme Corp", "Global Bank", "TechStart", "Future AI", "Nebula", "Orbit", "Quantum", "Hyperion", "Vertex"].map((logo, i) => (
                          <span key={`dup-${i}`} className="text-2xl font-bold text-zinc-700">{logo}</span>
                      ))}
                  </motion.div>
              </div>
          </div>
      </section>

      {/* 3. WORKFLOW / HOW IT WORKS */}
      <section id="how-it-works" className="py-32 px-6">
          <div className="max-w-7xl mx-auto">
              <div className="text-center mb-20">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">From Idea to App in Minutes</h2>
                  <p className="text-zinc-400 text-lg">No complex setup. Just describe, refine, and deploy.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { icon: <Smartphone size={32} />, title: "Describe", desc: "Tell MaxiGen what you want to build using natural language." },
                      { icon: <Sparkles size={32} />, title: "Generate", desc: "Our AI engine writes the code, sets up the database, and styles the UI." },
                      { icon: <Rocket size={32} />, title: "Deploy", desc: "Push to Netlify or download the code for your own pipeline." }
                  ].map((step, i) => (
                      <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.2 }}
                          viewport={{ once: true }}
                          className="p-8 rounded-[32px] bg-zinc-900 border border-white/5 hover:border-purple-500/30 transition-colors group"
                      >
                          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform group-hover:bg-purple-600">
                              {step.icon}
                          </div>
                          <h3 className="text-2xl font-bold mb-4">0{i+1}. {step.title}</h3>
                          <p className="text-zinc-400 leading-relaxed">{step.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* 4. BENTO GRID FEATURES */}
      <section id="features" className="py-32 px-6 bg-zinc-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
            <div className="mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to ship</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 rounded-[32px] bg-zinc-900 border border-white/10 p-8 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
                        <Code2 size={120} />
                    </div>
                    <div className="relative z-10 mt-auto">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
                            <Layers size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Multi-file Architecture</h3>
                        <p className="text-zinc-400">Generates separate files for Components, Hooks, and Styles.</p>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[32px] bg-zinc-900 border border-white/10 p-8 flex flex-col relative overflow-hidden"
                >
                    <div className="mt-auto">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-400">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">React Native</h3>
                        <p className="text-zinc-400">Export to Expo seamlessly.</p>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="rounded-[32px] bg-zinc-900 border border-white/10 p-8 flex flex-col relative overflow-hidden"
                >
                    <div className="mt-auto">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4 text-green-400">
                            <Cpu size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Integrations</h3>
                        <p className="text-zinc-400">Firebase, Supabase, Stripe.</p>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 rounded-[32px] bg-zinc-900 border border-white/10 p-8 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-black to-zinc-900 z-0" />
                    <div className="relative z-10 mt-auto flex items-end justify-between">
                        <div>
                            <div className="w-12 h-12 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4 text-teal-400">
                                <Rocket size={24} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Instant Netlify Deploy</h3>
                            <p className="text-zinc-400">One-click static deployments to global edge network.</p>
                        </div>
                        <button onClick={onGetStarted} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hidden md:block hover:bg-zinc-200">
                            Try It Now
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* 5. CODE DEMO SECTION */}
      <section className="py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
              <div className="flex-1">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Clean Code,<br />Zero Technical Debt</h2>
                  <p className="text-zinc-400 text-lg mb-8">
                      MaxiGen doesn't just "mock" apps. It writes industry-standard Typescript, React, and Tailwind code that you can actually maintain.
                  </p>
                  <ul className="space-y-4">
                      {["TypeScript Support", "Tailwind CSS Styling", "Modular Components", "Custom Hooks"].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-lg">
                              <CheckCircle2 size={24} className="text-green-500" />
                              {item}
                          </li>
                      ))}
                  </ul>
              </div>
              <div className="flex-1 w-full">
                  <motion.div 
                    initial={{ x: 50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#1e1e1e]"
                  >
                      <div className="bg-[#252526] px-4 py-3 flex items-center gap-2 border-b border-black">
                          <div className="flex gap-1.5">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                          </div>
                          <span className="ml-4 text-xs text-zinc-500 font-mono">src/App.tsx</span>
                      </div>
                      <div className="p-6 font-mono text-sm leading-relaxed overflow-hidden">
                          <span className="text-pink-400">import</span> <span className="text-blue-300">React</span>, {'{'} <span className="text-yellow-300">useState</span> {'}'} <span className="text-pink-400">from</span> <span className="text-orange-300">'react'</span>;<br/>
                          <br/>
                          <span className="text-blue-400">export default function</span> <span className="text-yellow-300">App</span>() {'{'}<br/>
                          &nbsp;&nbsp;<span className="text-blue-400">const</span> [<span className="text-blue-300">count</span>, <span className="text-yellow-300">setCount</span>] = <span className="text-yellow-300">useState</span>(<span className="text-green-300">0</span>);<br/>
                          <br/>
                          &nbsp;&nbsp;<span className="text-pink-400">return</span> (<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-blue-300">div</span> <span className="text-blue-400">className</span>=<span className="text-orange-300">"p-4 bg-black text-white"</span>&gt;<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;<span className="text-blue-300">h1</span>&gt;Hello MaxiGen&lt;/<span className="text-blue-300">h1</span>&gt;<br/>
                          &nbsp;&nbsp;&nbsp;&nbsp;&lt;/<span className="text-blue-300">div</span>&gt;<br/>
                          &nbsp;&nbsp;);<br/>
                          {'}'}
                          <motion.div 
                            className="inline-block w-2 h-5 bg-white ml-1 align-middle"
                            animate={{ opacity: [1, 0] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          />
                      </div>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* 6. INTEGRATIONS SECTION */}
      <section className="py-20 bg-zinc-900 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold mb-16">Power your app with top-tier services</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                  {[
                      { name: "Firebase", icon: <Database size={40} className="text-orange-500" /> },
                      { name: "Netlify", icon: <div className="w-10 h-10"><NetlifyIcon /></div> },
                      { name: "Stripe", icon: <DollarSign size={40} className="text-purple-500" /> },
                      { name: "GitHub", icon: <Code2 size={40} className="text-white" /> }
                  ].map((service, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.1 }}
                        className="flex flex-col items-center gap-4"
                      >
                          <div className="w-20 h-20 rounded-3xl bg-black border border-white/10 flex items-center justify-center shadow-xl p-4">
                              {service.icon}
                          </div>
                          <span className="font-bold text-lg">{service.name}</span>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* 7. STATS SECTION */}
      <section className="py-32 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                  { label: "Apps Generated", value: "10k+", icon: <Layers className="mx-auto mb-4 text-purple-500" /> },
                  { label: "Lines of Code", value: "2M+", icon: <Terminal className="mx-auto mb-4 text-blue-500" /> },
                  { label: "Time Saved", value: "5000h", icon: <Timer className="mx-auto mb-4 text-green-500" /> }
              ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-2xl bg-zinc-900/50 border border-white/5"
                  >
                      {stat.icon}
                      <div className="text-5xl font-bold mb-2">{stat.value}</div>
                      <div className="text-zinc-500 uppercase tracking-widest text-sm">{stat.label}</div>
                  </motion.div>
              ))}
          </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 px-6 bg-black">
          <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-16">What builders are saying</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                      { text: "I built my MVP in a weekend. The code quality is insane.", author: "Sarah J.", role: "Founder" },
                      { text: "It's like having a senior dev sitting next to you 24/7.", author: "Mike T.", role: "CTO" },
                      { text: "Finally, an AI that understands architecture, not just snippets.", author: "Alex R.", role: "Engineer" }
                  ].map((t, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -10 }}
                        className="p-8 rounded-[24px] bg-zinc-900 border border-white/10"
                      >
                          <div className="flex gap-1 text-yellow-500 mb-4">
                              {[1,2,3,4,5].map(s => <Star key={s} size={16} fill="currentColor" />)}
                          </div>
                          <p className="text-lg leading-relaxed mb-6">"{t.text}"</p>
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                              <div>
                                  <div className="font-bold">{t.author}</div>
                                  <div className="text-xs text-zinc-500">{t.role}</div>
                              </div>
                          </div>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* 9. PRICING */}
      <section id="pricing" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-4">Simple Plans</h2>
              <p className="text-zinc-400 text-center mb-16">Choose the right plan for your needs.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto">
                  {/* Free Plan */}
                  <div className="p-8 rounded-[32px] bg-zinc-900 border border-white/5">
                      <h3 className="text-xl font-bold mb-2">Free</h3>
                      <div className="text-4xl font-bold mb-6">$0<span className="text-lg font-normal text-zinc-500">/mo</span></div>
                      <ul className="space-y-4 mb-8 text-zinc-400">
                          <li className="flex gap-2"><CheckCircle2 size={18} /> 3 Projects</li>
                          <li className="flex gap-2"><CheckCircle2 size={18} /> Bring your own API Key</li>
                          <li className="flex gap-2"><CheckCircle2 size={18} /> Community Support</li>
                      </ul>
                      <button onClick={onGetStarted} className="w-full py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition-colors">Start Free</button>
                  </div>

                  {/* Plus Plan */}
                  <div className="p-8 rounded-[32px] bg-purple-900/20 border border-purple-500/50 relative overflow-hidden transform scale-105 shadow-2xl">
                      <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                      <h3 className="text-xl font-bold mb-2 text-purple-400">Plus</h3>
                      <div className="text-4xl font-bold mb-6">$19<span className="text-lg font-normal text-zinc-500">/mo</span></div>
                      <ul className="space-y-4 mb-8 text-zinc-300">
                          <li className="flex gap-2"><CheckCircle2 size={18} className="text-purple-400" /> Unlimited Projects</li>
                          <li className="flex gap-2"><CheckCircle2 size={18} className="text-purple-400" /> <strong>No API Key Required</strong></li>
                          <li className="flex gap-2"><CheckCircle2 size={18} className="text-purple-400" /> Priority Support</li>
                      </ul>
                      <button onClick={onGetStarted} className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-colors shadow-lg shadow-purple-900/50">Get Plus</button>
                  </div>
              </div>
          </div>
      </section>

      {/* 10. FOOTER CTA */}
      <section className="py-32 px-6 text-center bg-gradient-to-t from-purple-900/20 to-black">
          <div className="max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-bold mb-8">Ready to build your<br/>dream app?</h2>
              <p className="text-xl text-zinc-400 mb-12">Join 10,000+ developers shipping faster with MaxiGen.</p>
              <button 
                onClick={onGetStarted}
                className="px-12 py-5 bg-white text-black text-xl font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]"
              >
                  Start Building Now
              </button>
          </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 bg-black text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <Zap size={20} className="text-white fill-white" />
                <span className="font-bold text-lg">MaxiGen</span>
            </div>
            <div className="flex gap-8 text-sm text-zinc-500">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Twitter</a>
                <a href="#" className="hover:text-white">GitHub</a>
            </div>
            <p className="text-zinc-600 text-sm">© 2025 MaxiGen AI.</p>
        </div>
      </footer>
    </div>
  );
};