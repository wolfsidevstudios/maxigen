
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader2, Github } from 'lucide-react';
import { auth, githubProvider, yahooProvider } from '../services/firebaseConfig';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleYahooLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, yahooProvider);
      // Auth state listener in App.tsx will handle the rest
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Yahoo');
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setError('');
    try {
        await signInWithPopup(auth, githubProvider);
    } catch (err: any) {
        setError(err.message || 'Failed to sign in with GitHub');
        setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black flex relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* LEFT SIDE: Visuals */}
      <div className="hidden lg:flex w-1/2 relative z-10 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <Zap size={24} className="text-black fill-black" />
             </div>
             <span className="text-2xl font-bold text-white tracking-tight">MaxiGen</span>
        </div>

        <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Build apps at <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">lightspeed.</span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed">
                Join thousands of developers using AI to generate production-ready React applications in seconds.
            </p>
        </div>

        <div className="flex gap-4 text-sm text-zinc-500 font-medium">
            <span>© 2025 MaxiGen AI</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
        </div>
      </div>

      {/* RIGHT SIDE: Login Form (With Curved Edge) */}
      <div className="w-full lg:w-1/2 relative z-20 flex items-center justify-center">
        
        {/* Curved Divider (SVG Mask) */}
        <div className="hidden lg:block absolute left-[-80px] top-0 bottom-0 w-[100px] z-30 pointer-events-none">
            <svg height="100%" width="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M100 0 C 20 0 20 100 100 100 Z" fill="#09090b" />
            </svg>
        </div>

        <div className="w-full h-full lg:bg-zinc-950 flex items-center justify-center p-6 sm:p-12 relative">
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md space-y-8"
             >
                <div className="text-center lg:text-left">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome back' : 'Create an account'}
                    </h2>
                    <p className="text-zinc-400">
                        {isLogin ? 'Enter your details to access your workspace.' : 'Start building your dream app today.'}
                    </p>
                </div>

                {/* Social Login Stack */}
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={handleYahooLogin}
                        disabled={loading}
                        className="w-full h-12 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" fillRule="evenodd" d="M5 1a4 4 0 0 0 -4 4v14a4 4 0 0 0 4 4h14a4 4 0 0 0 4 -4V5a4 4 0 0 0 -4 -4H5Zm11.727 11h-3.273l3.273 -7.273H20L16.727 12ZM16 14.545a1.818 1.818 0 1 1 -3.636 0 1.818 1.818 0 0 1 3.636 0ZM7.273 8.363H4l3.636 8 -1.454 2.91H9.09l4.727 -10.91H10.91l-1.818 4.364 -1.818 -4.364Z" clipRule="evenodd"></path>
                                </svg>
                                Continue with Yahoo
                            </>
                        )}
                    </button>
                    <button 
                        onClick={handleGithubLogin}
                        disabled={loading}
                        className="w-full h-12 bg-[#24292e] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-[#2f363d] transition-colors border border-zinc-700"
                    >
                        {loading ? <Loader2 size={20} className="animate-spin" /> : (
                            <>
                                <Github size={20} />
                                Continue with GitHub
                            </>
                        )}
                    </button>
                </div>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span></div>
                </div>

                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-12 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-zinc-600"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                         <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
                         <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-xl px-12 text-white outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-900/20 hover:shadow-purple-900/40 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (
                            <>
                                {isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <p className="text-sm text-zinc-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <button 
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 text-white font-bold hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>

             </motion.div>
        </div>
      </div>
    </div>
  );
};
