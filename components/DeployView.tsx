
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedApp } from '../types';
import { deployToNetlify, getAuthUrl, exchangeCodeForToken } from '../services/netlifyService';
import { CheckCircle, ExternalLink, Loader2, AlertTriangle, LogOut, ArrowRight, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';

const NetlifyIcon = () => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd" strokeLinejoin="round" strokeMiterlimit="2" className="w-full h-full"><g transform="translate(9.167 9.167) scale(11.5703)"><clipPath id="prefix__a"><path d="M0 0h42.667v42.667H0z"/></clipPath><g clipPath="url(#prefix__a)"><path d="M23.99 24.43h-5.317l-.44-.44v-5.317l.44-.44h5.316l.442.44v5.316l-.442.442z" fill="#014847" fillRule="nonzero"/><g fill="#05bdba" fillRule="nonzero"><path d="M12.928 32.441h-.452l-2.255-2.254v-.448l3.447-3.451 2.388.004.319.315v2.388l-3.447 3.446zM10.221 12.928v-.452l2.255-2.255h.452l3.447 3.447v2.384l-.319.323h-2.388l-3.447-3.447zM13.395 23.25H.273L0 22.974v-3.287l.273-.275h13.122l.273.275v3.287l-.273.274zM42.393 23.25H29.272l-.273-.275v-3.287l.273-.275h13.121l.274.275v3.287l-.274.274zM19.417 13.395V3.553l.275-.273h3.287l.274.273v9.842l-.274.273h-3.287l-.275-.273zM19.417 39.11v-9.84l.275-.275h3.287l.274.274v9.84l-.274.274h-3.287l-.275-.274z"/></g></g></g></svg>
);

interface DeployViewProps {
  app: GeneratedApp;
  onSuccess?: (url: string) => void;
}

export const DeployView: React.FC<DeployViewProps> = ({ app, onSuccess }) => {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [deployUrl, setDeployUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // OAuth State
  const [oauthStep, setOauthStep] = useState<'init' | 'code' | 'authorized'>('init');
  const [authCode, setAuthCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [manualTokenMode, setManualTokenMode] = useState(false);

  const isMounted = useRef(true);
  
  useEffect(() => {
      isMounted.current = true;
      const savedToken = localStorage.getItem('netlify_token');
      if (savedToken) {
          setToken(savedToken);
          setOauthStep('authorized');
      }
      return () => { isMounted.current = false; };
  }, []);

  const addLog = (msg: string) => {
      if (isMounted.current) setLogs(prev => [...prev, `> ${msg}`]);
  };

  const handleConnect = () => {
      const url = getAuthUrl();
      window.open(url, '_blank', 'width=600,height=700');
      setOauthStep('code');
  };

  const handleVerifyCode = async () => {
      if (!authCode) return;
      setIsVerifying(true);
      setErrorMsg('');
      try {
          const newToken = await exchangeCodeForToken(authCode);
          localStorage.setItem('netlify_token', newToken);
          setToken(newToken);
          setOauthStep('authorized');
      } catch (e: any) {
          setErrorMsg(e.message || "Failed to verify code. Try manual token.");
      } finally {
          setIsVerifying(false);
      }
  };

  const handleManualTokenSave = () => {
      if(token) {
        localStorage.setItem('netlify_token', token);
        setOauthStep('authorized');
      }
  };

  const handleDisconnect = () => {
      localStorage.removeItem('netlify_token');
      setToken('');
      setOauthStep('init');
      setAuthCode('');
      setStatus('idle');
      setManualTokenMode(false);
  };

  const handleDeploy = async () => {
    if (!token) {
        setErrorMsg("Authentication token missing.");
        return;
    }

    setStatus('deploying');
    setLogs([]);
    setErrorMsg('');
    addLog("Initializing deployment sequence...");
    addLog(`Target: Netlify Cloud`);
    addLog(`Project: ${app.name}`);
    
    try {
        addLog("Preparing static assets...");
        await new Promise(r => setTimeout(r, 800)); // Sim delay
        addLog("Bundling files...");
        
        const result = await deployToNetlify(token, app);
        
        addLog("Upload complete.");
        addLog(`Site ID: ${result.id}`);
        addLog("Deployment successful!");
        
        setDeployUrl(result.url);
        setStatus('success');
        if (onSuccess) onSuccess(result.url);

    } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || "Deployment failed");
        addLog(`Error: ${err.message}`);
        setStatus('error');
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-zinc-950">
        <div className="w-full bg-zinc-900 rounded-[24px] overflow-hidden flex flex-col h-full border border-zinc-800">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
                <div>
                    <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                        <div className="w-6 h-6 rounded bg-zinc-800 p-1">
                            <NetlifyIcon />
                        </div>
                        Deploy to Netlify
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1">Host your app instantly on Netlify's global CDN.</p>
                </div>
                {oauthStep === 'authorized' && (
                    <button onClick={handleDisconnect} className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                        <LogOut size={12} /> Disconnect
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                
                {status === 'success' ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-900/20 border border-green-500/20 rounded-2xl p-8 text-center"
                    >
                        <div className="w-16 h-16 bg-green-900/50 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-800">
                            <CheckCircle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">Deployed Successfully!</h3>
                        <p className="text-green-300 mb-6 text-sm">Your app is live.</p>
                        
                        <div className="flex gap-3 justify-center">
                            <a 
                                href={deployUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 text-sm"
                            >
                                Visit Live App <ExternalLink size={16} />
                            </a>
                            <button
                                onClick={() => setStatus('idle')}
                                className="px-6 py-2.5 bg-transparent border border-green-800 text-green-400 font-bold rounded-full hover:bg-green-900/20 text-sm"
                            >
                                Deploy Again
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <>
                        {/* Auth Flow */}
                        {oauthStep === 'init' && !manualTokenMode && (
                            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                <div className="p-4 bg-zinc-950 rounded-full border border-zinc-800 shadow-xl mb-2">
                                    <div className="w-12 h-12">
                                        <NetlifyIcon />
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg">Connect Netlify Account</h3>
                                <p className="text-zinc-400 text-sm max-w-xs">Authorize MaxiGen to deploy sites to your Netlify account.</p>
                                <button 
                                    onClick={handleConnect}
                                    className="px-6 py-3 bg-[#00ad9f] hover:bg-[#008f83] text-white rounded-xl font-bold text-sm transition-all shadow-lg flex items-center gap-2"
                                >
                                    Connect Netlify <ArrowRight size={16} />
                                </button>

                                <div className="text-xs text-zinc-600 my-2">- OR -</div>

                                <button 
                                    onClick={() => setManualTokenMode(true)}
                                    className="text-xs text-zinc-500 hover:text-white underline"
                                >
                                    Use Personal Access Token
                                </button>
                            </div>
                        )}

                        {manualTokenMode && oauthStep === 'init' && (
                             <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                <h3 className="text-white font-bold text-lg">Manual Access Token</h3>
                                <p className="text-zinc-400 text-sm max-w-xs">Generate a token in Netlify User Settings {'>'} Applications.</p>
                                
                                <div className="w-full max-w-sm relative">
                                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        type="password"
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder="Paste nfp_... token"
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-[#00ad9f]/50 text-white text-sm"
                                    />
                                </div>

                                <button 
                                    onClick={handleManualTokenSave}
                                    disabled={!token}
                                    className="px-6 py-3 bg-white text-black rounded-xl font-bold text-sm transition-all shadow-lg hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    Save Token
                                </button>

                                <button 
                                    onClick={() => setManualTokenMode(false)}
                                    className="text-xs text-zinc-500 hover:text-white mt-2"
                                >
                                    Back to Connect
                                </button>
                             </div>
                        )}

                        {oauthStep === 'code' && (
                            <div className="space-y-4 max-w-sm mx-auto">
                                <div className="text-center mb-4">
                                    <h3 className="text-white font-bold">Verification</h3>
                                    <p className="text-zinc-400 text-xs mt-1">Paste the code shown in the Netlify popup window.</p>
                                </div>
                                
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        type="text" 
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                        placeholder="Paste verification code..." 
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-[#00ad9f]/50 focus:border-[#00ad9f] transition-all font-mono text-sm text-white"
                                        autoFocus
                                    />
                                </div>

                                <button 
                                    onClick={handleVerifyCode}
                                    disabled={!authCode || isVerifying}
                                    className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <Loader2 size={16} className="animate-spin" /> : "Verify Code"}
                                </button>
                                
                                <button onClick={() => setOauthStep('init')} className="w-full text-center text-xs text-zinc-500 hover:text-white mt-2">
                                    Cancel
                                </button>
                            </div>
                        )}

                        {oauthStep === 'authorized' && (
                            <>
                                <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-sm font-medium text-white">Connected to Netlify</span>
                                    </div>
                                    <span className="text-xs text-zinc-500 font-mono">Ready to deploy</span>
                                </div>

                                {/* Deploy Button */}
                                <button 
                                    onClick={handleDeploy}
                                    disabled={status === 'deploying'}
                                    className="w-full py-3 bg-[#00ad9f] text-white rounded-xl font-bold text-sm hover:bg-[#008f83] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00ad9f]/20"
                                >
                                    {status === 'deploying' ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Deploying...
                                        </>
                                    ) : (
                                        "Deploy Now"
                                    )}
                                </button>
                            </>
                        )}

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-500/20 flex items-start gap-3 text-sm animate-fade-in">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Error:</span> {errorMsg}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Logs Terminal */}
                {(status === 'deploying' || status === 'error' || status === 'success') && (
                    <div className="bg-black rounded-xl p-4 font-mono text-[10px] text-zinc-400 h-48 overflow-y-auto custom-scrollbar border border-zinc-800 shadow-inner">
                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-zinc-800">
                            <div className="w-2 h-2 rounded-full bg-red-500"/>
                            <div className="w-2 h-2 rounded-full bg-yellow-500"/>
                            <div className="w-2 h-2 rounded-full bg-green-500"/>
                            <span className="ml-2 opacity-50">Build Logs</span>
                        </div>
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="animate-fade-in">{log}</div>
                            ))}
                            {status === 'deploying' && (
                                <div className="animate-pulse">_</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
