
import JSZip from 'https://esm.sh/jszip';
import { GeneratedApp } from '../types';

const CLIENT_ID = '-eROvSTaLUWDqXPPA0JB1d9s9stSUjbsCUOD0UVtgB8';
const CLIENT_SECRET = 'BCMjZU3XuL7T6arM7kk5jhGkSJevxnPpxUa9GNSgOD0';

export const getAuthUrl = () => {
    return `https://app.netlify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=urn:ietf:wg:oauth:2.0:oob`;
};

export const exchangeCodeForToken = async (code: string) => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob');

    try {
        const response = await fetch('https://api.netlify.com/oauth/token', {
            method: 'POST',
            body: params,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (!response.ok) {
             const err = await response.json().catch(() => ({}));
             throw new Error(err.error_description || 'Failed to exchange code');
        }

        const data = await response.json();
        return data.access_token as string;
    } catch (error) {
        console.error("Netlify OAuth Error", error);
        throw error;
    }
};

export const getDeploymentStatus = async (token: string, deploymentId: string) => {
  // Not strictly needed for immediate Zip deploys as they are synchronous in this context,
  // but useful if we implement polling for async builds later.
  return { readyState: 'READY' };
};

const wrapReactCode = (code: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@0.292.0"></script>
  <title>App</title>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-presets="env,react">
    ${code
      .replace(/import\s+.*?from\s+['"].*?['"];?/g, '')
      .replace(/export\s+default\s+function\s+App/g, 'window.App = function App')
      .replace(/export\s+default\s+App/g, 'window.App = App')
    }
    
    // Lucide Icons Proxy
    const createLucideIcon = (name, iconData) => {
        return ({ color = "currentColor", size = 24, strokeWidth = 2, className = "", ...props }) => {
            const [tag, attrs, children] = iconData;
            const childElements = (children || []).map(([childTag, childAttrs], index) => 
                React.createElement(childTag, { ...childAttrs, key: index })
            );
            return React.createElement(tag || "svg", {
                ...attrs, width: size, height: size, stroke: color, strokeWidth, className, fill: "none", strokeLinecap: "round", strokeLinejoin: "round", ...props
            }, ...childElements);
        };
    };
    window.LucideReact = new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'default') return target;
            if (window.lucide && window.lucide.icons && window.lucide.icons[prop]) return createLucideIcon(prop, window.lucide.icons[prop]);
            return () => null;
        }
    });

    const Component = window.App || App;
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<Component />);
  </script>
</body>
</html>
`;

export const deployToNetlify = async (token: string, app: GeneratedApp) => {
  const zip = new JSZip();

  // Strategy: 
  // 1. If Web platform and files exist -> Zip them directly.
  // 2. If Mobile platform -> Wrap React Native code in a single HTML file (Babel Standalone) for browser preview.
  
  if (app.platform === 'web' && app.files && app.files.length > 0) {
      app.files.forEach(f => {
          let path = f.path;
          if (path.startsWith('src/')) path = path.replace('src/', '');
          if (path.startsWith('./')) path = path.replace('./', '');
          zip.file(path, f.content);
      });
  } else if (app.platform === 'mobile') {
      zip.file('index.html', wrapReactCode(app.reactNativeCode));
  } else {
      // Fallback: use webCompatibleCode as index.html
      zip.file('index.html', app.webCompatibleCode || '<h1>No code generated</h1>');
  }

  const content = await zip.generateAsync({ type: 'blob' });

  // Deploy to Netlify (Creates a new site and deploys in one go)
  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/zip',
    },
    body: content,
  });

  if (!response.ok) {
    throw new Error('Netlify deployment failed. Check your access token or network connection.');
  }

  const data = await response.json();
  return {
      id: data.id,
      url: data.ssl_url || data.url,
      adminUrl: data.admin_url
  };
};
