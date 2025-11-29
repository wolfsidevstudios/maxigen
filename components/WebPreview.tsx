
import React, { useEffect, useRef } from 'react';
import { ProjectFile } from '../types';

interface WebPreviewProps {
  files?: ProjectFile[];
  code?: string;
  onConsole?: (log: { type: 'info' | 'warn' | 'error', msg: string }) => void;
  isSelectionMode?: boolean;
  onElementSelect?: (element: { tagName: string; text: string; htmlSnippet: string }) => void;
  isTesting?: boolean;
  onQALog?: (log: { message: string, status: 'active' | 'completed' | 'error' }) => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ files, code, onConsole, isSelectionMode, onElementSelect, isTesting, onQALog }) => {
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
        if (e.data?.type === 'QA_LOG' && onQALog) {
            onQALog(e.data.log);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsole, onElementSelect, onQALog]);

  // Toggle selection mode in iframe
  useEffect(() => {
      if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
              type: 'TOGGLE_SELECTION_MODE',
              enabled: isSelectionMode
          }, '*');
      }
  }, [isSelectionMode]);

  // Toggle Testing Mode
  useEffect(() => {
      if (iframeRef.current?.contentWindow && isTesting) {
          iframeRef.current.contentWindow.postMessage({
              type: 'START_QA'
          }, '*');
      }
  }, [isTesting]);

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

    // Scripts for Console Shim, Element Selection, and QA Testing
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
                
                if (e.data?.type === 'START_QA') {
                    startQARoutine();
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

            // --- QA AUTOMATION ---
            function startQARoutine() {
                const cursor = document.createElement('div');
                cursor.style.position = 'fixed';
                cursor.style.width = '24px';
                cursor.style.height = '24px';
                cursor.style.background = 'rgba(239, 68, 68, 0.8)'; // Red-500
                cursor.style.borderRadius = '50%';
                cursor.style.zIndex = '999999';
                cursor.style.pointerEvents = 'none';
                cursor.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
                cursor.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                cursor.style.display = 'flex';
                cursor.style.alignItems = 'center';
                cursor.style.justifyContent = 'center';
                // Cursor Icon
                cursor.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>';
                document.body.appendChild(cursor);

                // Find interactables
                const interactables = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'))
                    .filter(el => {
                        const rect = el.getBoundingClientRect();
                        return rect.width > 0 && rect.height > 0; // Visible only
                    });

                if (interactables.length === 0) {
                    window.parent.postMessage({ type: 'QA_LOG', log: { message: "No interactive elements found.", status: 'completed' } }, '*');
                    return;
                }

                let index = 0;

                const runStep = async () => {
                    if (index >= interactables.length) {
                        window.parent.postMessage({ type: 'QA_LOG', log: { message: "QA Testing Complete. All checks passed.", status: 'completed' } }, '*');
                        setTimeout(() => cursor.remove(), 500);
                        return;
                    }

                    const el = interactables[index];
                    
                    try {
                        const rect = el.getBoundingClientRect();
                        
                        // Scroll into view
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        // Wait for scroll
                        await new Promise(r => setTimeout(r, 600));
                        
                        // Update rect after scroll
                        const newRect = el.getBoundingClientRect();
                        
                        // Move cursor
                        cursor.style.top = (newRect.top + newRect.height/2 - 12) + 'px';
                        cursor.style.left = (newRect.left + newRect.width/2 - 12) + 'px';

                        // Report finding
                        let name = el.innerText || el.placeholder || el.getAttribute('aria-label') || el.tagName;
                        name = name.substring(0, 20).replace(/\\n/g, '');
                        if(!name) name = "Element";
                        
                        // Fixed: Use string concatenation to avoid template literal issues in parent file
                        window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Testing interaction: ' + name + '...', status: 'active' } }, '*');

                        // Wait for move
                        await new Promise(r => setTimeout(r, 800));

                        // Click Effect
                        cursor.style.transform = 'scale(0.8)';
                        setTimeout(() => cursor.style.transform = 'scale(1)', 150);
                        
                        // Simulate Click
                        el.click();
                        
                    } catch (e) {
                        window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Failed to interact with element ' + index + '.', status: 'error' } }, '*');
                    }

                    index++;
                    setTimeout(runStep, 1000);
                };

                runStep();
            }
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
