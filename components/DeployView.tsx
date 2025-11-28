
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedApp } from '../types';
import { deployToVercel, getDeploymentStatus } from '../services/vercelService';
import { Rocket, CheckCircle, ExternalLink, Loader2, AlertTriangle, Key, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
  
  // Ref to handle unmount updates
  const isMounted = useRef(true);
  useEffect(() => {
      isMounted.current = true;
      // Load token from local storage
      const savedToken = localStorage.getItem('vercel_token');
      if (savedToken) setToken(savedToken);
      
      return () => { isMounted.current = false; };
  }, []);

  const addLog = (msg: string) => {
      if (isMounted.current) setLogs(prev => [...prev, `> ${msg}`]);
  };

  const handleDeploy = async () => {
    if (!token) {
        setErrorMsg("Please enter your Vercel API Token");
        return;
    }

    // Save token
    localStorage.setItem('vercel_token', token);

    setStatus('deploying');
    setLogs([]);
    setErrorMsg('');
    addLog("Initializing deployment sequence...");
    addLog(`Target: Vercel Cloud`);
    addLog(`Project: ${app.name}`);
    
    try {
        addLog("Bundling assets (React + Vite)...");
        // Simulated bundling delay for UX
        await new Promise(r => setTimeout(r, 800));
        addLog("Configuring package.json...");
        addLog("Uploading files to Vercel...");
        
        const result = await deployToVercel({
            token,
            projectName: app.name,
            appData: app
        });
        
        addLog("Upload complete. Build queued.");
        addLog(`Deployment ID: ${result.id}`);
        addLog("Waiting for build to complete...");

        // POLLING LOOP
        const deploymentId = result.id;
        const pollInterval = setInterval(async () => {
            if (!isMounted.current) {
                clearInterval(pollInterval);
                return;
            }
            try {
                const statusData = await getDeploymentStatus(token, deploymentId);
                const state = statusData.readyState; // QUEUED, BUILDING, READY, ERROR, CANCELED

                if (state === 'READY') {
                    clearInterval(pollInterval);
                    const finalUrl = `https://${statusData.url}`;
                    setDeployUrl(finalUrl);
                    addLog("Build successful!");
                    addLog(`Live URL: ${finalUrl}`);
                    setStatus('success');
                    if (onSuccess) onSuccess(finalUrl);
                } else if (state === 'ERROR' || state === 'CANCELED') {
                    clearInterval(pollInterval);
                    setStatus('error');
                    setErrorMsg("Build failed on Vercel side. Check logs in Vercel dashboard.");
                    addLog(`Error: Deployment state is ${state}`);
                } else {
                    addLog(`Status: ${state}...`);
                }
            } catch (err: any) {
                // If checking status fails (e.g. network), just log and retry
                addLog(`Status check warning: ${err.message}`);
            }
        }, 3000);

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
                        <Rocket size={18} className="text-white" />
                        Deploy to Vercel
                    </h2>
                    <p className="text-zinc-400 text-xs mt-1">Updates will target the same project URL.</p>
                </div>
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
                        <p className="text-green-300 mb-6 text-sm">Your changes are live.</p>
                        
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
                        {/* Token Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Key size={12} /> Vercel API Token
                            </label>
                            <div className="relative">
                                <input 
                                    type="password" 
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="Paste token..." 
                                    className="w-full pl-4 pr-10 py-3 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-mono text-sm text-white"
                                />
                                {token && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500"><CheckCircle size={14} /></div>}
                            </div>
                            <p className="text-[10px] text-zinc-500">
                                Token is saved locally for future deploys.
                            </p>
                        </div>

                        {/* Error Message */}
                        {status === 'error' && (
                            <div className="p-4 bg-red-900/20 text-red-400 rounded-xl border border-red-500/20 flex items-start gap-3 text-sm">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-bold">Deployment Failed:</span> {errorMsg}
                                </div>
                            </div>
                        )}

                        {/* Deploy Button */}
                        <button 
                            onClick={handleDeploy}
                            disabled={status === 'deploying' || !token}
                            className="w-full py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {status === 'deploying' ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Deploying Update...
                                </>
                            ) : (
                                "Deploy Changes"
                            )}
                        </button>
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