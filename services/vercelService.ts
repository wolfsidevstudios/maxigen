
import { GeneratedApp } from '../types';

const BASE_URL = 'https://api.vercel.com/v13/deployments';

interface VercelFile {
  file: string;
  data: string;
}

interface DeployConfig {
  token: string;
  projectName: string;
  appData: GeneratedApp;
}

// Default configuration files for a Vite React app
const getPackageJson = (name: string) => JSON.stringify({
  "name": name.toLowerCase().replace(/\s+/g, '-'),
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.292.0",
    "framer-motion": "^10.16.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}, null, 2);

const getViteConfig = () => `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;

const getIndexHtml = (title: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>body { font-family: 'Inter', sans-serif; }</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

const getMainJsx = () => `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

export const getDeploymentStatus = async (token: string, deploymentId: string) => {
  const response = await fetch(`${BASE_URL}/${deploymentId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
     throw new Error("Failed to check status");
  }
  return await response.json();
};

export const deployToVercel = async ({ token, projectName, appData }: DeployConfig) => {
  let cleanName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!cleanName) cleanName = 'maxigen-app';
  
  // Ensure the production code has React imported, otherwise build fails
  let prodCode = appData.reactNativeCode;
  if (!prodCode.includes("import React")) {
      prodCode = "import React from 'react';\n" + prodCode;
  }

  // Construct the file tree
  const files: VercelFile[] = [
    { file: 'package.json', data: getPackageJson(cleanName) },
    { file: 'vite.config.js', data: getViteConfig() },
    { file: 'index.html', data: getIndexHtml(appData.name) },
    { file: 'src/main.jsx', data: getMainJsx() },
    { file: 'src/index.css', data: "@tailwind base;\n@tailwind components;\n@tailwind utilities;" },
    { file: 'src/App.jsx', data: prodCode } // reactNativeCode holds the production React code for Web platform
  ];

  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: cleanName,
        files: files,
        projectSettings: {
          framework: 'vite',
        },
        target: 'production' // Force production deployment
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Deployment failed');
    }

    const data = await response.json();
    return data; // Contains 'url', 'readyState', 'id', etc.
  } catch (error) {
    console.error("Vercel deployment error:", error);
    throw error;
  }
};
