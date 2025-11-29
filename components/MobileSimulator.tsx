
import React, { useEffect, useRef } from 'react';

interface MobileSimulatorProps {
  code: string;
  refreshKey?: number;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({ code, refreshKey = 0 }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updateIframe = () => {
      if (!iframeRef.current) return;
      const doc = iframeRef.current.contentDocument;
      if (!doc) return;

      // Sanitize code: 
      // 1. Remove imports (browsers can't handle them in standard scripts without maps)
      // 2. Convert 'export default function App' -> 'window.App = function App'
      // 3. Convert 'export default App' -> 'window.App = App'
      const safeCode = code
        .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
        .replace(/export\s+default\s+function\s+App/g, 'window.App = function App')
        .replace(/export\s+default\s+App/g, 'window.App = App');

      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <!-- React & ReactDOM -->
          <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
          <!-- Babel -->
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <!-- Lucide Icons -->
          <script src="https://unpkg.com/lucide@0.292.0"></script>
          <!-- Google Fonts & Material Symbols -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
          
          <style>
            body { 
                background-color: #ffffff; 
                height: 100vh; 
                overflow: hidden; 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
            }
            .font-poppins { font-family: 'Poppins', sans-serif; }
            .font-mono { font-family: 'Roboto Mono', monospace; }
            
            .material-symbols-outlined {
              font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }

            ::-webkit-scrollbar { width: 0px; background: transparent; }
            #root { height: 100%; display: flex; flex-direction: column; }
            
            @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in { animation: fade-in 0.3s ease-out; }
          </style>
          
          <script>
            // CONSOLE OVERRIDE FOR PARENT COMMUNICATION
            (function() {
              const oldLog = console.log;
              const oldWarn = console.warn;
              const oldError = console.error;
              
              function send(type, args) {
                try {
                  const msg = args.map(a => 
                    typeof a === 'object' ? JSON.stringify(a) : String(a)
                  ).join(' ');
                  window.parent.postMessage({ type: 'CONSOLE_LOG', log: { type, msg } }, '*');
                } catch(e) {}
              }

              console.log = function(...args) { oldLog.apply(console, args); send('info', args); };
              console.warn = function(...args) { oldWarn.apply(console, args); send('warn', args); };
              console.error = function(...args) { oldError.apply(console, args); send('error', args); };
              
              window.onerror = function(msg, url, line) {
                send('error', [msg + ' (' + line + ')']);
              };
            })();

            tailwind.config = {
              theme: {
                extend: {
                  colors: {
                    primary: '#000000',
                    secondary: '#f4f4f5',
                    zinc: {
                        50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7',
                        300: '#d4d4d8', 400: '#a1a1aa', 500: '#71717a',
                        600: '#52525b', 700: '#3f3f46', 800: '#27272a',
                        900: '#18181b', 950: '#09090b',
                    }
                  },
                  fontFamily: {
                    sans: ['Inter', 'sans-serif'],
                    heading: ['Poppins', 'sans-serif'],
                    mono: ['Roboto Mono', 'monospace'],
                  }
                }
              }
            }
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel" data-presets="env,react">
            // Error Boundary
            class ErrorBoundary extends React.Component {
              constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
              }
              static getDerivedStateFromError(error) {
                return { hasError: true, error };
              }
              render() {
                if (this.state.hasError) {
                  return (
                    <div className="p-6 text-red-500 text-center flex flex-col items-center justify-center h-full bg-white">
                      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
                           <circle cx="12" cy="12" r="10"></circle>
                           <line x1="12" y1="8" x2="12" y2="12"></line>
                           <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <h2 className="font-bold mb-2 text-zinc-900">Runtime Error</h2>
                      <p className="text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg w-full font-mono text-xs text-left overflow-auto max-h-40">{this.state.error.toString()}</p>
                    </div>
                  );
                }
                return this.props.children;
              }
            }

            try {
              // --- Lucide React Shim ---
              const createLucideIcon = (name, iconData) => {
                  return ({ color = "currentColor", size = 24, strokeWidth = 2, className = "", ...props }) => {
                      if (!Array.isArray(iconData)) return null;

                      const [tag, attrs, children] = iconData;
                      const safeChildren = Array.isArray(children) ? children : [];
                      
                      const childElements = safeChildren.map(([childTag, childAttrs], index) => 
                          React.createElement(childTag, { ...childAttrs, key: index })
                      );
                      
                      return React.createElement(
                          tag || "svg",
                          {
                              ...attrs,
                              width: size,
                              height: size,
                              stroke: color,
                              strokeWidth: strokeWidth,
                              className: className,
                              fill: "none",
                              strokeLinecap: "round", 
                              strokeLinejoin: "round",
                              ...props
                          },
                          ...childElements
                      );
                  };
              };

              // Proxy that safely returns components, not objects
              window.LucideReact = new Proxy({}, {
                  get: (target, prop) => {
                      if (typeof prop !== 'string') return undefined;
                      if (prop === 'default') return target;
                      
                      if (window.lucide && window.lucide.icons && window.lucide.icons[prop]) {
                          return createLucideIcon(prop, window.lucide.icons[prop]);
                      }
                      
                      const lowerKey = Object.keys(window.lucide?.icons || {}).find(k => k.toLowerCase() === prop.toLowerCase());
                      if (lowerKey) {
                           return createLucideIcon(lowerKey, window.lucide.icons[lowerKey]);
                      }

                      return ({ size = 24, ...props }) => React.createElement(
                          "svg",
                          { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props },
                          React.createElement("rect", { x: 3, y: 3, width: 18, height: 18, rx: 2, ry: 2 }),
                          React.createElement("line", { x1: 9, y1: 9, x2: 15, y2: 15 }),
                          React.createElement("line", { x1: 15, y1: 9, x2: 9, y2: 15 })
                      );
                  }
              });

              const SafeAreaView = ({ children, className = "", ...props }) => (
                <div className={"flex flex-col flex-1 pb-safe pt-safe " + className} {...props}>{children}</div>
              );

              // --- User Code Injection ---
              ${safeCode}
              
              // Render
              // Check both window.App (from sanitized export default) and global App (from const App)
              const Component = window.App || (typeof App !== 'undefined' ? App : undefined);

              if (Component) {
                 const root = ReactDOM.createRoot(document.getElementById('root'));
                 root.render(
                   <ErrorBoundary>
                     <Component />
                   </ErrorBoundary>
                 );
              } else {
                 throw new Error("App component not defined. Code must define 'const App = ...' or 'export default function App'");
              }

            } catch (err) {
              const root = ReactDOM.createRoot(document.getElementById('root'));
              root.render(
                <div className="p-4 text-red-500 flex flex-col items-center justify-center h-full text-center">
                  <p className="font-bold text-sm">Compilation Error</p>
                  <pre className="text-xs mt-2 bg-gray-50 p-2 rounded w-full overflow-auto text-left">{err.message}</pre>
                </div>
              );
            }
          </script>
        </body>
        </html>
      `;

      doc.open();
      doc.write(html);
      doc.close();
    };

    updateIframe();
  }, [code, refreshKey]);

  return (
    <div className="w-full h-full bg-white">
        <iframe
        ref={iframeRef}
        title="Mobile Preview"
        className="w-full h-full border-none bg-white select-none pointer-events-auto"
        sandbox="allow-scripts allow-same-origin"
        />
    </div>
  );
};
