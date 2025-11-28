
import React, { useEffect, useRef } from 'react';
import { ProjectFile } from '../types';

interface WebPreviewProps {
  files?: ProjectFile[];
  code?: string;
  onConsole?: (log: { type: 'info' | 'warn' | 'error', msg: string }) => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ files, code, onConsole }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Message Listener for console logs from iframe
    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'CONSOLE_LOG' && onConsole) {
            onConsole(e.data.log);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsole]);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    let content = "";
    
    if (files && files.length > 0) {
        // Find index.html or use the first file
        const index = files.find(f => f.path.endsWith('index.html')) || files[0];
        content = index.content;
        
        // Simple Bundler: Inject CSS files replacing <link> tags
        files.filter(f => f.path.endsWith('.css')).forEach(f => {
            const name = f.path.split('/').pop() || '';
            // Match href="style.css", href="./style.css", href="/style.css"
            const regex = new RegExp(`<link[^>]*href=["']\\.?\\/?${name}["'][^>]*>`, 'g');
            content = content.replace(regex, `<style>${f.content}</style>`);
        });

        // Simple Bundler: Inject JS files replacing <script> tags
        files.filter(f => f.path.endsWith('.js')).forEach(f => {
            const name = f.path.split('/').pop() || '';
            const regex = new RegExp(`<script[^>]*src=["']\\.?\\/?${name}["'][^>]*><\\/script>`, 'g');
            content = content.replace(regex, `<script>${f.content}</script>`);
        });
    } else {
        content = code || "";
    }

    // Console shim to capture logs and send to parent
    const consoleScript = `
      <script>
        (function() {
            const _log = (t, a) => {
                try { window.parent.postMessage({ type: 'CONSOLE_LOG', log: { type: t, msg: Array.from(a).join(' ') } }, '*'); } catch(e){}
            };
            console.log = (...args) => { _log('info', args); };
            console.warn = (...args) => { _log('warn', args); };
            console.error = (...args) => { _log('error', args); };
            window.onerror = (msg) => { _log('error', [msg]); };
        })();
      </script>
    `;
    
    // Inject script at the beginning of head or body
    if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${consoleScript}`);
    } else if (content.includes('<body>')) {
        content = content.replace('<body>', `<body>${consoleScript}`);
    } else {
        content = `${consoleScript}${content}`;
    }

    doc.open();
    doc.write(content);
    doc.close();
    
  }, [files, code]);

  return (
    <div className="w-full h-full bg-white">
        <iframe 
            ref={iframeRef}
            className="w-full h-full border-none bg-white"
            title="Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin"
        />
    </div>
  );
};
