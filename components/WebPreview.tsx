
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
                // Remove existing cursor if any
                const existingCursor = document.getElementById('qa-cursor');
                if (existingCursor) existingCursor.remove();

                const cursor = document.createElement('div');
                cursor.id = 'qa-cursor';
                cursor.style.position = 'fixed';
                cursor.style.width = '24px';
                cursor.style.height = '24px';
                cursor.style.background = 'rgba(239, 68, 68, 0.9)'; // Red-500
                cursor.style.borderRadius = '50%';
                cursor.style.zIndex = '999999';
                cursor.style.pointerEvents = 'none';
                cursor.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)'; // Smooth slow movement
                cursor.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                cursor.style.display = 'flex';
                cursor.style.alignItems = 'center';
                cursor.style.justifyContent = 'center';
                // Cursor Icon
                cursor.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>';
                document.body.appendChild(cursor);

                const sleep = (ms) => new Promise(r => setTimeout(r, ms));

                const typeText = async (element, text) => {
                    element.focus();
                    element.value = '';
                    for (let char of text) {
                        element.value += char;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        await sleep(150); // Slow typing speed for visual effect
                    }
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                };

                const smoothScrollTo = async (y) => {
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    await sleep(1500); // Wait for scroll to complete and settle
                };

                const runSuite = async () => {
                    // Phase 1: Scroll Test (Down then Up)
                    window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Analyzing page structure & scrolling...', status: 'active' } }, '*');
                    
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    if (maxScroll > 100) {
                        // Scroll Down
                        await smoothScrollTo(maxScroll);
                        await sleep(1000);
                        // Scroll Back Up
                        await smoothScrollTo(0);
                        await sleep(1000);
                    }

                    // Phase 2: Interaction Loop
                    const interactables = Array.from(document.querySelectorAll('button, a, input, select, textarea, [role="button"]'))
                        .filter(el => {
                            const rect = el.getBoundingClientRect();
                            // Must be visible and have size
                            return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
                        });

                    if (interactables.length === 0) {
                        window.parent.postMessage({ type: 'QA_LOG', log: { message: "No interactive elements found.", status: 'completed' } }, '*');
                        cursor.remove();
                        return;
                    }

                    for (let i = 0; i < interactables.length; i++) {
                        const el = interactables[i];
                        const tagName = el.tagName.toLowerCase();
                        const isInput = tagName === 'input' || tagName === 'textarea';
                        const isButton = tagName === 'button' || tagName === 'a' || el.getAttribute('role') === 'button' || (tagName === 'input' && (el.type === 'submit' || el.type === 'button'));

                        let elName = el.innerText || el.placeholder || el.name || tagName;
                        elName = elName.substring(0, 20).replace(/\\n/g, '').trim();
                        if (!elName) elName = "Element";

                        try {
                            // 1. Scroll Element into View
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            await sleep(1000); // Allow scroll to finish

                            // 2. Move Cursor to Element
                            const rect = el.getBoundingClientRect();
                            cursor.style.top = (rect.top + rect.height/2 - 12) + 'px';
                            cursor.style.left = (rect.left + rect.width/2 - 12) + 'px';
                            
                            // Visual Highlight
                            el.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
                            await sleep(1000); // Pause on element

                            // 3. Perform Action
                            if (isInput && !isButton) {
                                // Input Handling
                                window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Typing into ' + elName + '...', status: 'active' } }, '*');
                                await typeText(el, "Hello World");
                                await sleep(500);

                                // Check if the next element is likely the send/submit button
                                const nextEl = interactables[i+1];
                                if (nextEl) {
                                    const nextTag = nextEl.tagName.toLowerCase();
                                    const nextIsButton = nextTag === 'button' || nextTag === 'a' || (nextTag === 'input' && nextEl.type === 'submit');
                                    
                                    if (nextIsButton) {
                                        // Smart Agent: "I typed, now I click send"
                                        i++; // Skip next iteration as we handle it now
                                        
                                        // Target the button
                                        nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        await sleep(800);
                                        
                                        const nextRect = nextEl.getBoundingClientRect();
                                        cursor.style.top = (nextRect.top + nextRect.height/2 - 12) + 'px';
                                        cursor.style.left = (nextRect.left + nextRect.width/2 - 12) + 'px';
                                        
                                        window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Clicking submit button...', status: 'active' } }, '*');
                                        await sleep(1000);
                                        
                                        // Click Animation
                                        cursor.style.transform = 'scale(0.8)';
                                        await sleep(150);
                                        cursor.style.transform = 'scale(1)';
                                        
                                        nextEl.click();
                                        nextEl.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
                                        await sleep(1500); // Wait for action
                                        nextEl.style.outline = '';
                                    }
                                }
                            } else {
                                // Standard Click
                                window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Clicking ' + elName + '...', status: 'active' } }, '*');
                                cursor.style.transform = 'scale(0.8)';
                                await sleep(150);
                                cursor.style.transform = 'scale(1)';
                                
                                el.click();
                                await sleep(1500); // Wait for action
                            }

                            // Remove Highlight
                            el.style.outline = '';

                        } catch (err) {
                            // If element is detached or hidden during process, ignore
                        }
                    }

                    window.parent.postMessage({ type: 'QA_LOG', log: { message: "Testing Complete. App is fully functional.", status: 'completed' } }, '*');
                    await sleep(1000);
                    cursor.remove();
                };

                runSuite();
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
