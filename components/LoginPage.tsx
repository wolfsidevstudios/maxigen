
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, ArrowRight, Loader2, Github } from 'lucide-react';
import { auth, googleProvider } from '../services/firebaseConfig';
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

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithPopup(auth, googleProvider);
      // Auth state listener in App.tsx will handle the rest
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
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

                {/* Social Login */}
                <button 
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 bg-white text-black rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
                >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : (
                        <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                            Continue with Google
                        </>
                    )}
                </button>

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
