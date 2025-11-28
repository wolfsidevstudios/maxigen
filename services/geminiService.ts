
import { GoogleGenAI, Type, Schema, Part, Tool } from "@google/genai";
import { GeneratedApp, Platform, GenerationMode, AIModel, ProjectPlan } from "../types";
import { processCodeWithMedia } from "./mediaService";

// Helper to get the AI client with the most current key
const getAI = () => {
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
  if (!apiKey) {
    console.warn("No API Key found in localStorage or env");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

// --- SCHEMAS ---

const fileSchema: Schema = {
    type: Type.OBJECT,
    properties: {
        path: { type: Type.STRING, description: "File path (e.g., 'index.html', 'script.js')" },
        content: { type: Type.STRING, description: "The full code content." }
    },
    required: ["path", "content"]
};

const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A catchy, modern app title with an emoji." },
    targetAudience: { type: Type.STRING, description: "Who is this app for?" },
    features: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 key features (use emojis)." },
    techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technologies (HTML5, Tailwind, JS)." },
    fileStructureSummary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-level list of main files." },
    colorPalette: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of hex codes or Tailwind color names." }
  },
  required: ["title", "features", "techStack", "fileStructureSummary"]
};

const multiAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    screens: {
      type: Type.ARRAY,
      items: {
          type: Type.OBJECT,
          properties: {
            files: { type: Type.ARRAY, items: fileSchema },
            reactNativeCode: { type: Type.STRING },
            webCompatibleCode: { type: Type.STRING },
            explanation: { type: Type.STRING },
            name: { type: Type.STRING },
            icon: { type: Type.STRING }
          },
          required: ["files", "webCompatibleCode", "name", "explanation"]
      }
    },
    edgeFunctions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          trigger: { type: Type.STRING, enum: ["http", "schedule", "db_event"] },
          code: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ["name", "trigger", "code", "description"]
      }
    },
    projectExplanation: { type: Type.STRING },
    suggestedIntegrations: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["screens", "projectExplanation", "suggestedIntegrations"],
};

// --- FUNCTIONS ---

export const generateProjectPlan = async (
    prompt: string,
    modelName: AIModel = 'gemini-2.5-flash'
): Promise<ProjectPlan> => {
    const ai = getAI();
    
    const systemInstruction = `
      You are an expert Senior Product Manager and Architect.
      
      GOAL: Create a robust, modern project plan for a Web App based on the user's request.
      
      TONE: Professional, Energetic, Organized. USE EMOJIS abundantly.
      FORMAT: Return JSON matching the schema.
      
      REQUIREMENTS:
      1. Title: Catchy and includes an emoji.
      2. Features: 3-5 bullet points, bold key terms.
      3. Tech Stack: HTML5, Tailwind CSS, Vanilla JavaScript.
      4. File Structure: Propose a clean structure (index.html, style.css, script.js).
      5. Aesthetic: Dark Mode, Black/White/Grey, Glossy UI.
    `;

    try {
        let selectedModel = modelName as string;
        if (selectedModel === 'gemini-2.5-pro') selectedModel = 'gemini-3-pro-preview';

        const response = await ai.models.generateContent({
            model: selectedModel,
            contents: { parts: [{ text: `Create a plan for: ${prompt}` }] },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: planSchema
            }
        });

        const text = response.text || "{}";
        return JSON.parse(text) as ProjectPlan;
    } catch (error) {
        console.error("Error generating plan:", error);
        throw error;
    }
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
    
    TONE: Friendly, Professional, Emoji-rich 🚀.
    OUTPUT: JSON.
    
    CRITICAL: 
    - The user wants a **FRESH BUILD**. Do not assume previous files exist.
    - **DELETE OLD CODE**: The files you generate will completely replace any existing files.
    - **EMOJIS**: Use emojis in your explanation to make it engaging.
    - **BOLD**: Use **bold** for important concepts in the explanation.

    VISUAL GUIDELINES (STRICT):
    - THEME: Ultra-Modern Dark Mode. Palette: Black (#000000), White (#FFFFFF), and Zinc Greys.
    - BACKGROUNDS: Use 'bg-black' or 'bg-zinc-950' for the main page background.
    - CARDS/CONTAINERS: Use "Frosted Glass" / "Glossy" effects. 
      Example: 'bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-xl'.
    - TEXT: Primary text must be 'text-white'. Secondary text 'text-zinc-400'.
    - SHAPES: Deep rounding. Use 'rounded-[24px]' or 'rounded-[32px]' for cards and containers.
    - BUTTONS: 
      - Primary: 'bg-white text-black hover:bg-zinc-200 rounded-full font-bold'.
      - Secondary: 'bg-zinc-800/50 text-white border border-white/10 hover:bg-zinc-800 rounded-full'.
    - BORDERS: Subtle and refined. 'border-white/5' or 'border-white/10'.
    - INPUTS: 'bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 rounded-xl focus:ring-white/20'.

    Technologies:
       - HTML5
       - Tailwind CSS (via CDN)
       - Vanilla JavaScript (ES6+)
       - FontAwesome or Lucide (via CDN) if needed
       
    MEDIA & IMAGES (MANDATORY):
    - NEVER use placeholder URLs like placehold.co.
    - USE THIS FORMAT FOR IMAGES: "https://maxigen.media/image?q=SEARCH_TERM" (e.g. "https://maxigen.media/image?q=modern office")
    
    FIREBASE:
    ${firebaseConfig ? `
    - Config provided. Implement REAL Authentication and Firestore using Firebase JS SDK (ES Modules via CDN).
    - Initialize app in 'firebase.js' or 'script.js'.
    ` : `- Simulate Auth if requested.`}
    
    REVENUECAT:
    ${revenueCatKey ? `
    - Key provided: ${revenueCatKey}
    - Implement REAL in-app subscriptions using RevenueCat Web SDK (@revenuecat/purchases-js via CDN/ESM).
    - Create a 'paywall.js' or similar to handle displaying packages and purchasing.
    ` : ''}
  `;

  // --- WEB INSTRUCTIONS (HTML/CSS/JS) ---
  const webInstructions = `
    PLATFORM: WEB (Standard HTML5 + Tailwind CSS + Vanilla JS)

    IMPORTANT: You MUST generate a full MULTI-FILE structure in the 'files' array.

    Expected Structure:
    1. 'index.html' (Main entry point. MUST include <script src="https://cdn.tailwindcss.com"></script>)
    2. 'style.css' (Custom styles for glassmorphism/animations if needed)
    3. 'script.js' (Interactive logic)
    4. 'README.md' (Optional instructions)

    CRITICAL RULES:
    - DO NOT use React, JSX, or 'import' statements that require a bundler (unless using ES modules browser-natively).
    - Use standard ES6 JavaScript.
    - Use Tailwind CSS for styling via the CDN link in the <head>.
    - Ensure 'index.html' links to 'style.css' (<link rel="stylesheet">) and 'script.js' (<script src="script.js" defer></script>).
    - Do not use '@/' alias for imports.
  `;

  const mobileInstructions = `
    PLATFORM: MOBILE (React Native / Expo)
    - Generate VALID Expo React Native code.
    - Use <View>, <Text>, <TouchableOpacity>, <SafeAreaView>.
  `;

  const systemInstruction = `
    ${commonRules}
    ${platform === 'web' ? webInstructions : mobileInstructions}
    ${mode === 'redesign' ? 'MODE: REDESIGN. Modernize UI.' : 'MODE: GENERATE. Build from scratch.'}
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

export const editAppCode = async (
    currentApp: GeneratedApp, 
    userPrompt: string, 
    image?: string, 
    modelName: AIModel = 'gemini-2.5-flash', 
    firebaseConfig?: string, 
    revenueCatKey?: string
): Promise<GeneratedApp> => {
  const ai = getAI();

  const systemInstruction = `
    You are an expert Senior Developer.
    TASK: UPDATE the existing app based on: "${userPrompt}".
    
    TONE: Friendly, Helpful, **Bold** important parts, use Emojis 🛠️.
    
    OUTPUT: JSON containing 'files' and 'webCompatibleCode'.
    
    RULES:
    - MODIFY the 'files' array to reflect changes.
    - If it's a web app, ensure you maintain 'index.html', 'script.js', etc.
    - VISUALS: Maintain the "MaxiGen Aesthetic": Dark Mode, Black/White/Grey, Glossy/Frosted UI, rounded-[28px] cards.
    ${firebaseConfig ? `Config: ${firebaseConfig}` : ''}
  `;
  
  const context = currentApp.files 
    ? `CURRENT FILES JSON:\n${JSON.stringify(currentApp.files)}`
    : `CURRENT CODE:\n${currentApp.webCompatibleCode}`;

  const parts: Part[] = [{ text: `${context}\n\nREQUEST: "${userPrompt}"` }];
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
           responseSchema: {
              type: Type.OBJECT,
              properties: {
                files: { type: Type.ARRAY, items: fileSchema },
                reactNativeCode: { type: Type.STRING },
                webCompatibleCode: { type: Type.STRING },
                explanation: { type: Type.STRING },
                name: { type: Type.STRING },
                icon: { type: Type.STRING }
              }
           }
      },
    });

    const result = JSON.parse(response.text || "{}");
    const processedWebCode = await processCodeWithMedia(result.webCompatibleCode);
    
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
        reactNativeCode: result.reactNativeCode, // fallback
        files: processedFiles,
        platform: currentApp.platform, 
        edgeFunctions: currentApp.edgeFunctions 
    } as GeneratedApp;
  } catch (error) {
    console.error("Error editing app:", error);
    throw error;
  }
};
