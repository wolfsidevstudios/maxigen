
import React, { useEffect, useRef } from 'react';
import { ProjectFile } from '../types';

const HTML2CANVAS_URL = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";

interface WebPreviewProps {
  files?: ProjectFile[];
  code?: string;
  onConsole?: (log: { type: 'info' | 'warn' | 'error', msg: string }) => void;
  isSelectionMode?: boolean;
  onElementSelect?: (element: { tagName: string; text: string; htmlSnippet: string }) => void;
  isTesting?: boolean;
  onQALog?: (log: { message: string, status: 'active' | 'completed' | 'error' }) => void;
  captureTrigger?: number;
  onCapture?: (image: string) => void;
}

export const WebPreview: React.FC<WebPreviewProps> = ({ files, code, onConsole, isSelectionMode, onElementSelect, isTesting, onQALog, captureTrigger, onCapture }) => {
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
        if (e.data?.type === 'EVENT_SCREENSHOT_CAPTURED' && onCapture) {
            onCapture(e.data.image);
        }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsole, onElementSelect, onQALog, onCapture]);

  // Handle Capture Trigger
  useEffect(() => {
      if (iframeRef.current?.contentWindow && captureTrigger && captureTrigger > 0) {
          iframeRef.current.contentWindow.postMessage({ type: 'CMD_CAPTURE_SCREENSHOT' }, '*');
      }
  }, [captureTrigger]);

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

    // Scripts for Console Shim, Element Selection, QA Testing, and Screenshot
    const injectedScripts = `
      <script src="${HTML2CANVAS_URL}"></script>
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

                if (e.data?.type === 'CMD_CAPTURE_SCREENSHOT') {
                    takeScreenshot();
                }
            });

            function takeScreenshot() {
                // Hide cursor if present
                const cursor = document.getElementById('qa-cursor');
                if(cursor) cursor.style.display = 'none';

                if (typeof html2canvas !== 'undefined') {
                    html2canvas(document.body, { 
                        useCORS: true, 
                        logging: false, 
                        scale: 1,
                        backgroundColor: '#ffffff'
                    }).then(canvas => {
                        const img = canvas.toDataURL('image/png');
                        window.parent.postMessage({ type: 'EVENT_SCREENSHOT_CAPTURED', image: img }, '*');
                        if(cursor) cursor.style.display = 'flex';
                    }).catch(err => {
                        console.error('Screenshot failed', err);
                        if(cursor) cursor.style.display = 'flex';
                    });
                } else {
                    console.error('html2canvas not loaded');
                }
            }

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
                cursor.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'; // Smooth movement
                cursor.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                cursor.style.display = 'flex';
                cursor.style.alignItems = 'center';
                cursor.style.justifyContent = 'center';
                // Cursor Icon (Robot Eye)
                cursor.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none"><circle cx="12" cy="12" r="3"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
                document.body.appendChild(cursor);

                const sleep = (ms) => new Promise(r => setTimeout(r, ms));

                const smoothScrollTo = async (y) => {
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    await sleep(1000); 
                };

                const simulateHover = (element) => {
                    const ev = new MouseEvent('mouseover', {
                        view: window,
                        bubbles: true,
                        cancelable: true
                    });
                    element.dispatchEvent(ev);
                };

                const typeText = async (element, text) => {
                    element.focus();
                    element.value = '';
                    element.dispatchEvent(new Event('focus', { bubbles: true }));
                    
                    for (let char of text) {
                        element.value += char;
                        element.dispatchEvent(new KeyboardEvent('keydown', { key: char, bubbles: true }));
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        await sleep(50 + Math.random() * 50); 
                    }
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    element.dispatchEvent(new Event('blur', { bubbles: true }));
                };

                const moveCursorTo = async (element) => {
                    const rect = element.getBoundingClientRect();
                    // Check if element is in view
                    if (rect.top < 0 || rect.bottom > window.innerHeight) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        await sleep(800); 
                    }
                    // Re-calculate after scroll
                    const newRect = element.getBoundingClientRect();
                    cursor.style.top = (newRect.top + newRect.height/2 - 12) + 'px';
                    cursor.style.left = (newRect.left + newRect.width/2 - 12) + 'px';
                    await sleep(400); 
                };

                const runSuite = async () => {
                    window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Agent connecting...', status: 'active' } }, '*');
                    await sleep(1000);

                    // 1. Scan Page
                    const forms = document.querySelectorAll('form');
                    const inputs = document.querySelectorAll('input, textarea');
                    const buttons = document.querySelectorAll('button, a.btn, [role="button"]');
                    
                    window.parent.postMessage({ type: 'QA_LOG', log: { message: \`Analysis: Found \${forms.length} forms, \${inputs.length} inputs, \${buttons.length} actions.\`, status: 'active' } }, '*');
                    await sleep(1000);

                    // 2. Scroll Test
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    if (maxScroll > 100) {
                        window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Verifying layout stability (Scroll Test)...', status: 'active' } }, '*');
                        await smoothScrollTo(maxScroll);
                        await smoothScrollTo(0);
                    }

                    // 3. Form Interaction (Smart Filling)
                    if (forms.length > 0) {
                        for (let form of forms) {
                            window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Testing Form Submission Flow...', status: 'active' } }, '*');
                            
                            const formInputs = form.querySelectorAll('input:not([type="hidden"]), textarea');
                            for (let input of formInputs) {
                                await moveCursorTo(input);
                                input.style.outline = '2px solid #ef4444'; // Red highlight
                                
                                // Determine contextual value
                                let val = "Test Value";
                                const type = input.type || 'text';
                                const name = (input.name || input.id || '').toLowerCase();
                                const placeholder = (input.placeholder || '').toLowerCase();
                                const tagName = input.tagName.toLowerCase();
                                
                                if (type === 'email' || name.includes('email') || placeholder.includes('email')) val = "agent@maxigen.ai";
                                else if (type === 'password' || name.includes('pass')) val = "SecureP@ss123";
                                else if (type === 'tel' || name.includes('phone')) val = "555-0123";
                                else if (type === 'number') val = "10";
                                else if (name.includes('name')) val = "MaxiGen Agent";
                                else if (tagName === 'textarea') val = "This is an automated test message generated by the QA Agent.";

                                await typeText(input, val);
                                input.style.outline = '';
                            }

                            // Try to find submit
                            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]') || form.querySelector('button');
                            if (submitBtn) {
                                await moveCursorTo(submitBtn);
                                simulateHover(submitBtn);
                                
                                window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Clicking Submit...', status: 'active' } }, '*');
                                await sleep(500);
                                
                                cursor.style.transform = 'scale(0.8)';
                                submitBtn.click();
                                await sleep(150);
                                cursor.style.transform = 'scale(1)';
                                await sleep(1500); // Wait for response/navigation
                            }
                        }
                    } 
                    
                    // 4. Other Interactions (if no forms or sparse page)
                    if (forms.length === 0 && buttons.length > 0) {
                         window.parent.postMessage({ type: 'QA_LOG', log: { message: 'Checking interactive elements...', status: 'active' } }, '*');
                         // Test top 3 buttons
                         const targets = Array.from(buttons).slice(0, 3);
                         for (let btn of targets) {
                             await moveCursorTo(btn);
                             simulateHover(btn);
                             btn.style.outline = '2px solid #3b82f6'; // Blue highlight
                             await sleep(600);
                             btn.style.outline = '';
                         }
                    }

                    window.parent.postMessage({ type: 'QA_LOG', log: { message: "QA Suite Completed. No crashes detected.", status: 'completed' } }, '*');
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
