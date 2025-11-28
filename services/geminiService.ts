
import { GoogleGenAI, Type, Schema, Part, Tool } from "@google/genai";
import { GeneratedApp, Platform, GenerationMode, AIModel } from "../types";
import { processCodeWithMedia } from "./mediaService";

// Helper to get the AI client with the most current key
const getAI = () => {
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found in localStorage or env");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// Common File Schema
const fileSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        path: { type: Type.STRING, description: "File path (e.g., '/src/components/Header.tsx' or '/package.json')" },
        content: { type: Type.STRING, description: "The full code content of the file." }
    },
    required: ["path", "content"]
};

// Schema for a single app screen (used for Editing)
const singleAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    files: {
        type: Type.ARRAY,
        items: fileSchema,
        description: "The full project file structure. MUST be populated for Web apps."
    },
    reactNativeCode: {
      type: Type.STRING,
      description: "Legacy/Backup: The main entry point code (e.g., App.tsx) as a single file.",
    },
    webCompatibleCode: {
      type: Type.STRING,
      description: "A single-file, self-contained React component for the legacy iframe preview. Still required for Mobile view.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief, friendly explanation of the generated app features.",
    },
    name: {
      type: Type.STRING,
      description: "A short, catchy name for the screen/app.",
    },
    icon: {
      type: Type.STRING,
      description: "A beautiful, modern, colorful SVG string (<svg>...</svg>) representing this app.",
    }
  },
  required: ["files", "reactNativeCode", "webCompatibleCode", "explanation", "name", "icon"],
};

// Schema for multiple app screens + Edge Functions (used for New Generations)
const multiAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    screens: {
      type: Type.ARRAY,
      description: "A list of app screens/pages.",
      items: singleAppSchema
    },
    edgeFunctions: {
      type: Type.ARRAY,
      description: "List of serverless backend functions needed for this app.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Function name (e.g. sendEmail)" },
          trigger: { type: Type.STRING, enum: ["http", "schedule", "db_event"] },
          code: { type: Type.STRING, description: "Node.js serverless function code (export default async function handler...)" },
          description: { type: Type.STRING, description: "What this function does" }
        },
        required: ["name", "trigger", "code", "description"]
      }
    },
    projectExplanation: {
      type: Type.STRING,
      description: "A summary of the entire generated project.",
    },
    suggestedIntegrations: {
      type: Type.ARRAY,
      description: "A list of 3-5 technical integrations or datasets.",
      items: { type: Type.STRING }
    }
  },
  required: ["screens", "projectExplanation", "suggestedIntegrations"],
};

export const generateAppCode = async (
    prompt: string, 
    platform: Platform, 
    image?: string,
    mode: GenerationMode = 'default',
    referenceUrl?: string,
    modelName: AIModel = 'gemini-2.5-flash',
    firebaseConfig?: string,
    revenueCatKey?: string
): Promise<{ screens: GeneratedApp[], explanation: string, sources?: {title: string, uri: string}[], suggestedIntegrations?: string[], edgeFunctions?: any[] }> => {
  
  const ai = getAI();
  
  const commonRules = `
    You are an elite Senior Frontend Engineer.
    
    CORE GOAL: Generate a PRODUCTION-READY, MULTI-FILE project.
    
    Technologies:
       - React (Functional Components, Hooks)
       - Tailwind CSS (Utility classes)
       - Lucide React (Icons)
       
    MEDIA & IMAGES (MANDATORY):
    - NEVER use placeholder URLs like placehold.co.
    - USE THIS FORMAT FOR IMAGES: "https://maxigen.media/image?q=SEARCH_TERM" (e.g. "https://maxigen.media/image?q=modern office")
    - USE THIS FORMAT FOR VIDEO: "https://maxigen.media/video?q=SEARCH_TERM" (e.g. "https://maxigen.media/video?q=nature loop")
    
    FIREBASE AUTHENTICATION:
    ${firebaseConfig ? `
    - A valid 'firebaseConfig' has been provided.
    - YOU MUST IMPLEMENT AUTHENTICATION if the app requires user context.
    - Use 'firebase/auth' SDK methods (getAuth, signInWithEmailAndPassword, etc).
    - Initialize Firebase apps inside a useEffect to avoid double-init.
    ` : `- If the user requests Auth but no config is provided, simulate it visually.`}

    REVENUECAT PAYMENTS (MONETIZATION):
    ${revenueCatKey ? `
    - A valid RevenueCat API Key has been provided: "${revenueCatKey}".
    - YOU MUST IMPLEMENT REAL IN-APP PAYMENTS using the RevenueCat SDK.
    - Use '@revenuecat/purchases-js' (Web) or 'react-native-purchases' (Mobile).
    ` : ''}
  `;

  // --- WEB INSTRUCTIONS (FULL DESIGN SYSTEM) ---
  const webInstructions = `
    PLATFORM: WEB (React TypeScript + Tailwind CSS)
    
    IMPORTANT: You MUST generate a full file structure in the 'files' array.
    
    Required Files in 'files' array:
    1. '/src/main.tsx' (Entry point, MUST render <App /> into root div using ReactDOM.createRoot)
    2. '/src/App.tsx' (Main Component)
    3. '/src/index.css' (Tailwind directives: @tailwind base; @tailwind components; @tailwind utilities;)
    4. '/src/components/...' (Break UI into small, reusable components)
    5. '/package.json' (Dependencies: react, react-dom, lucide-react, framer-motion, firebase (if needed), @revenuecat/purchases-js (if needed))
    
    Design Philosophy:
    - Grid System: 8px grid.
    - Spacing: generous padding (p-6, p-8).
    - Cards: rounded-[28px], white bg, soft shadow-xl.
    - Typography: Inter font, clear hierarchy.
    - Colors: Zinc neutrals + Vibrant Accents (Violet/Blue/Orange).
  `;

  const mobileInstructions = `
    PLATFORM: MOBILE (React Native / Expo)
    - Generate VALID Expo React Native code.
    - Use <View>, <Text>, <TouchableOpacity>, <SafeAreaView>.
    - Use 'lucide-react-native'.
    - 'files' should include 'App.tsx' and components in 'src/'.
    - 'webCompatibleCode': Simulate the mobile UI using React DOM (divs that look like views).
  `;

  let modeSpecificInstructions = mode === 'redesign' 
      ? `MODE: REDESIGN. Modernize the UI to 'Award Winning' standard. rounded-[28px].` 
      : mode === 'copy' 
      ? `MODE: COPY. Extract design system from reference.` 
      : `MODE: GENERATE. Build a COMPLETE app.`;

  const systemInstruction = `
    ${commonRules}
    ${platform === 'web' ? webInstructions : mobileInstructions}
    ${modeSpecificInstructions}
  `;

  const parts: Part[] = [{ text: prompt }];
  if (image) parts.push({ inlineData: { mimeType: 'image/png', data: image } });

  try {
    let selectedModel = modelName as string;
    if (selectedModel === 'gemini-2.5-pro') selectedModel = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: multiAppSchema,
        maxOutputTokens: 60000
      },
    });

    const text = response.text || "{}";
    let data = JSON.parse(text);
    
    const processedScreens = await Promise.all((data.screens as any[]).map(async (screen) => {
        const processedWebCode = await processCodeWithMedia(screen.webCompatibleCode);
        const processedNativeCode = await processCodeWithMedia(screen.reactNativeCode);
        
        // Process files if they exist
        let processedFiles = screen.files;
        if (processedFiles && Array.isArray(processedFiles)) {
             processedFiles = await Promise.all(processedFiles.map(async (f: any) => ({
                 ...f,
                 content: await processCodeWithMedia(f.content)
             })));
        }

        return { 
            ...screen, 
            webCompatibleCode: processedWebCode, 
            reactNativeCode: processedNativeCode, 
            files: processedFiles,
            platform 
        };
    }));

    return {
        screens: processedScreens as GeneratedApp[],
        explanation: data.projectExplanation as string,
        suggestedIntegrations: data.suggestedIntegrations,
        edgeFunctions: data.edgeFunctions
    };

  } catch (error) {
    console.error("Error generating app:", error);
    throw error;
  }
};

export const editAppCode = async (currentApp: GeneratedApp, userPrompt: string, image?: string, modelName: AIModel = 'gemini-2.5-flash', firebaseConfig?: string, revenueCatKey?: string): Promise<GeneratedApp> => {
  const ai = getAI();

  const systemInstruction = `
    You are an expert Senior Developer.
    TASK: UPDATE the existing app based on: "${userPrompt}".
    Platform: ${currentApp.platform}.
    
    Your output MUST include 'files' (the multi-file structure) AND 'webCompatibleCode' (the single-file preview).
    
    RULES:
    - MODIFY the 'files' array to reflect changes. split components if needed.
    - Ensure 'src/main.tsx' exists and renders App correctly.
    - UI BOOST: rounded-[28px], padded images, soft shadows.
    - AUTH: Implement Firebase Auth if config provided.
    - PAYMENTS: Implement RevenueCat (Real SDK) if key provided: "${revenueCatKey || ''}".
    ${firebaseConfig ? `Config: ${firebaseConfig}` : ''}
  `;
  
  // Send current file structure if available, otherwise code
  const context = currentApp.files 
    ? `CURRENT FILES:\n${JSON.stringify(currentApp.files)}`
    : `CURRENT CODE:\n${currentApp.webCompatibleCode}`;

  const parts: Part[] = [{ text: `${context}\n\nREQUEST: "${userPrompt}"` }];
  if (image) parts.push({ inlineData: { mimeType: 'image/png', data: image } });

  try {
    let selectedModel = modelName as string;
    if (selectedModel === 'gemini-2.5-pro') selectedModel = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: { systemInstruction, responseMimeType: "application/json", responseSchema: singleAppSchema, maxOutputTokens: 60000 },
    });

    const result = JSON.parse(response.text || "{}");
    const processedWebCode = await processCodeWithMedia(result.webCompatibleCode);
    const processedNativeCode = await processCodeWithMedia(result.reactNativeCode);
    
    let processedFiles = result.files;
    if (processedFiles && Array.isArray(processedFiles)) {
            processedFiles = await Promise.all(processedFiles.map(async (f: any) => ({
                ...f,
                content: await processCodeWithMedia(f.content)
            })));
    }

    return { 
        ...result, 
        webCompatibleCode: processedWebCode, 
        reactNativeCode: processedNativeCode,
        files: processedFiles,
        platform: currentApp.platform, 
        edgeFunctions: currentApp.edgeFunctions 
    } as GeneratedApp;
  } catch (error) {
    console.error("Error editing app:", error);
    throw error;
  }
};
