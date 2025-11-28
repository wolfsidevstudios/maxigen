
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
        path: { type: Type.STRING, description: "File path (e.g., 'src/components/Header.tsx')" },
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
    techStack: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of technologies (React, Tailwind, etc)." },
    fileStructureSummary: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-level list of main folders/files." },
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
      2. Features: 3-5 bullet points, bold key terms (e.g., "**Auth**: Secure login...").
      3. Tech Stack: React, Tailwind, Lucide, Framer Motion, Firebase (if needed).
      4. File Structure: Propose a clean feature-based or component-based structure.
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
    - **MODERN UI**: Use 'Inter' font, rounded-[28px] cards, generous padding, glassmorphism, and smooth animations.
    - **EMOJIS**: Use emojis in your explanation to make it engaging.
    - **BOLD**: Use **bold** for important concepts in the explanation.

    Technologies:
       - React (Functional Components, Hooks)
       - Tailwind CSS (Utility classes)
       - Lucide React (Icons)
       - Framer Motion (Animations)
       
    MEDIA & IMAGES (MANDATORY):
    - NEVER use placeholder URLs like placehold.co.
    - USE THIS FORMAT FOR IMAGES: "https://maxigen.media/image?q=SEARCH_TERM" (e.g. "https://maxigen.media/image?q=modern office")
    
    FIREBASE:
    ${firebaseConfig ? `
    - Config provided. Implement REAL Authentication and Firestore.
    - Initialize app in 'src/firebase.ts'.
    ` : `- Simulate Auth if requested.`}

    REVENUECAT:
    ${revenueCatKey ? `
    - Key provided: "${revenueCatKey}".
    - Implement REAL payments using '@revenuecat/purchases-js'.
    ` : ''}
  `;

  // --- WEB INSTRUCTIONS (FULL DESIGN SYSTEM) ---
  const webInstructions = `
    PLATFORM: WEB (React TypeScript + Tailwind CSS)
    
    IMPORTANT: You MUST generate a full file structure in the 'files' array.
    
    Required Files in 'files' array:
    1. '/src/main.tsx' (Entry point, renders <App />)
    2. '/src/App.tsx' (Main Component)
    3. '/src/index.css' (Tailwind directives)
    4. '/src/components/...' (Break UI into small, reusable components)
    
    Design Philosophy:
    - Grid System: 8px grid.
    - Spacing: generous padding (p-6, p-8).
    - Colors: Zinc neutrals + Vibrant Accents.
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
    - KEEP 'src/main.tsx' and 'src/index.css'.
    - UI BOOST: rounded-[28px], padded images, soft shadows.
    - PAYMENTS: If key provided ("${revenueCatKey || ''}"), ensure RevenueCat is integrated.
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

    // We use singleAppSchema from original file, assuming it's imported or defined nearby. 
    // Re-defining purely for this snippet context if needed, but assuming existing import structure holds.
    // For this update, I will trust the environment has the schema or I would need to re-declare it.
    // To be safe, I'll rely on the fact that I'm replacing the whole file content in previous steps or just updating the function.
    // But since I'm replacing the file content, I need to make sure schemas are there.
    // (In the full file replacement above, I included schemas).
    
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: { 
          systemInstruction, 
          responseMimeType: "application/json", 
          // Note: Using 'multiAppSchema' structure but strictly for one screen return or adapting 
          // The previous 'singleAppSchema' was better. Let's use a simpler inline schema or the one defined at top.
          // I will use a simplified schema definition here to ensure it works.
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
