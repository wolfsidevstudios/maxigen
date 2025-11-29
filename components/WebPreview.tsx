
import React, { useEffect, useRef } from 'react';
import { ProjectFile } from '../types';

interface WebPreviewProps {
  files?: ProjectFile[];
  code?: string;
  onConsole?: (log: { type: 'info' | 'warn' | 'error', msg: string }) => void;
  isSelectionMode?: boolean;
  onElementSelect?: (element: { tagName: string; text: string; htmlSnippet: string }) => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ files, code, onConsole, isSelectionMode, onElementSelect }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle incoming messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
        if (e.data?.type === 'CONSOLE_LOG' && onConsole) {
            onConsole(e.data.log);
        }
        if (e.data?.type === 'ELEMENT_SELECTED' && onElementSelect) {
            onElementSelect(e.data.element);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsole, onElementSelect]);

  // Toggle selection mode in iframe
  useEffect(() => {
      if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
              type: 'TOGGLE_SELECTION_MODE',
              enabled: isSelectionMode
          }, '*');
      }
  }, [isSelectionMode]);

  // Render Iframe Content
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

    // Scripts for Console Shim and Element Selection
    const injectedScripts = `
      <script>
        (function() {
            // --- CONSOLE SHIM ---
            const _log = (t, a) => {
                try { window.parent.postMessage({ type: 'CONSOLE_LOG', log: { type: t, msg: Array.from(a).join(' ') } }, '*'); } catch(e){}
            };
            console.log = (...args) => { _log('info', args); };
            console.warn = (...args) => { _log('warn', args); };
            console.error = (...args) => { _log('error', args); };
            window.onerror = (msg) => { _log('error', [msg]); };

            // --- ELEMENT SELECTION ---
            let selectionMode = false;
            let hoveredEl = null;
            let originalOutline = '';
            let originalCursor = '';

            window.addEventListener('message', (e) => {
                if (e.data?.type === 'TOGGLE_SELECTION_MODE') {
                    selectionMode = e.data.enabled;
                    if (!selectionMode && hoveredEl) {
                        hoveredEl.style.outline = originalOutline;
                        hoveredEl.style.cursor = originalCursor;
                        hoveredEl = null;
                    }
                }
            });

            document.addEventListener('mouseover', (e) => {
                if (!selectionMode) return;
                e.stopPropagation();
                
                // Restore previous
                if (hoveredEl && hoveredEl !== e.target) {
                    hoveredEl.style.outline = originalOutline;
                    hoveredEl.style.cursor = originalCursor;
                }
                
                hoveredEl = e.target;
                originalOutline = hoveredEl.style.outline;
                originalCursor = hoveredEl.style.cursor;
                
                hoveredEl.style.outline = '2px solid #3b82f6';
                hoveredEl.style.cursor = 'crosshair';
            }, true);

            document.addEventListener('mouseout', (e) => {
                if (!selectionMode) return;
                // We don't clear immediately to avoid flickering when moving between nested elements
            }, true);

            document.addEventListener('click', (e) => {
                if (!selectionMode) return;
                e.preventDefault();
                e.stopPropagation();
                
                const el = e.target;
                const data = {
                    tagName: el.tagName.toLowerCase(),
                    text: el.innerText ? el.innerText.substring(0, 50) : '',
                    htmlSnippet: el.outerHTML.substring(0, 300) // Limit size
                };
                
                // Cleanup
                if (hoveredEl) {
                    hoveredEl.style.outline = originalOutline;
                    hoveredEl.style.cursor = originalCursor;
                }
                hoveredEl = null;
                selectionMode = false;

                window.parent.postMessage({ type: 'ELEMENT_SELECTED', element: data }, '*');
            }, true);
        })();
      </script>
    `;
    
    // Inject scripts
    if (content.includes('<head>')) {
        content = content.replace('<head>', `<head>${injectedScripts}`);
    } else if (content.includes('<body>')) {
        content = content.replace('<body>', `<body>${injectedScripts}`);
    } else {
        content = `${injectedScripts}${content}`;
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
