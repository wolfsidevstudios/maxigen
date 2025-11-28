
import { GoogleGenAI, Type, Schema, Part, Tool } from "@google/genai";
import { GeneratedApp, Platform, GenerationMode, AIModel } from "../types";
import { processCodeWithMedia } from "./mediaService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for a single app screen (used for Editing)
const singleAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reactNativeCode: {
      type: Type.STRING,
      description: "The production-ready source code. If Platform is Web: Standard React + Tailwind code with ALL IMPORTS.",
    },
    webCompatibleCode: {
      type: Type.STRING,
      description: "A functional React component for the iframe preview. DO NOT use imports. DO NOT use 'export default'. Define the main component GLOBALLY as 'const App = () => { ... }'.",
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
  required: ["reactNativeCode", "webCompatibleCode", "explanation", "name", "icon"],
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
  
  const commonRules = `
    You are an elite Senior Frontend Engineer and Product Designer.
    
    CORE PHILOSOPHY: "GO ABOVE AND BEYOND".
    - Never build a "shell". Build a WORKING APP.
    - Use 'useState' to store lists of data. Use 'setTimeout' to simulate loading.
    - INTERACTIVITY IS KING.
    
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
    
    WEB IMPLEMENTATION:
    - Use '@revenuecat/purchases-js'.
    - Import: "import { Purchases } from '@revenuecat/purchases-js';"
    - Initialize: "Purchases.configure('${revenueCatKey}', 'app_user_id');" inside a useEffect.
    - Fetch Offerings: "const offerings = await Purchases.getOfferings();"
    - Purchase: "await Purchases.purchasePackage(package);"
    
    MOBILE IMPLEMENTATION (React Native):
    - Use 'react-native-purchases'.
    - Import: "import Purchases from 'react-native-purchases';"
    - Initialize: "Purchases.configure({ apiKey: '${revenueCatKey}' });"
    
    UI REQUIREMENTS:
    - Create a 'Paywall' component or modal.
    - List available packages (Monthly, Annual).
    - Styling should be premium (highlight 'Most Popular').
    ` : ''}
  `;

  // --- WEB INSTRUCTIONS (FULL DESIGN SYSTEM) ---
  const webInstructions = `
    PLATFORM: WEB (React TypeScript + Tailwind CSS)
    
    CRITICAL RULE: DO NOT GENERATE REACT NATIVE CODE. Use standard HTML tags (div, span, h1, button, input) styled with Tailwind CSS.
    
    ARCHITECTURE: 
    - Build a Single Page Application (SPA) contained within a single file.
    - Use internal state ('activeTab', 'currentView') to manage navigation between "pages" (Dashboard, Settings, etc.).
    
    *** CORE DESIGN PHILOSOPHY ***
    1. Layout and Spacing:
       - Grid System: Use an 8px grid (Tailwind classes are based on 4px, so increments of 2).
       - Generous Whitespace: Use 'p-6', 'p-8', 'gap-6', 'gap-8'. Avoid clutter.
       - Card-Based Layouts: Group content in white cards ('bg-white') with 'rounded-[28px]' and subtle shadows ('shadow-sm' or 'shadow-lg').
    
    2. Color Palette:
       - Light Mode Default: 'bg-zinc-50' for page background. 'text-zinc-900' for headings. 'text-zinc-500' for secondary text.
       - Accents: Use 'blue-600', 'orange-500', or 'violet-600' for primary actions.
       - Gradients: Use subtle gradients like 'bg-gradient-to-br from-orange-50 via-white to-pink-50'.
    
    3. Components and Elements:
       - Buttons: Primary = Solid color, 'rounded-full', 'px-6 py-3'. Secondary = 'bg-white border border-zinc-200'.
       - Inputs: 'bg-zinc-50', 'border-zinc-200', 'rounded-xl', 'focus:ring-2'.
       - Icons: Use 'lucide-react'. Destructure them: 'const { Home, User } = LucideReact;'.
    
    4. Visual Effects:
       - Radius: ENFORCE 'rounded-[28px]' for containers/cards and 'rounded-2xl' for inner elements.
       - Glassmorphism: Use 'backdrop-blur-xl bg-white/80' for sticky headers or overlays.
       - Shadows: Soft, diffused shadows ('shadow-xl shadow-black/5').
    
    *** SPECIFIC UI PATTERNS ***
    
    A. LANDING PAGES:
       - Navigation: A TOP FLOATING PILL-SHAPED TASKBAR. (e.g., 'fixed top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full px-6 py-2 shadow-lg border border-white/20').
       - Hero: Split layout. Left: "Welcome Back" login/signup form. Right: Testimonial card or branding.
       - Style: 'bg-gradient-to-br from-orange-50 via-white to-pink-50'.
    
    B. DASHBOARDS:
       - Sidebar: Fixed left, thin, white, clean icons.
       - Header: Minimal, glassmorphic.
       - Cards: Large stats cards, charts (visualize with bars/lines using divs), data tables with 'border-b border-zinc-100'.
       - Layout: 'flex h-screen bg-zinc-50'.
    
    BACKEND (Edge Functions):
    - If the app needs backend logic (Stripe, Email, Database), generate "Edge Functions" in the response schema.
  `;

  const mobileInstructions = `
    PLATFORM: MOBILE (React Native / Expo)
    - Generate VALID Expo React Native code.
    - Use <View>, <Text>, <TouchableOpacity>, <SafeAreaView>.
    - Use 'lucide-react-native'.
    - Preview Code: Simulate the mobile UI using React DOM + Tailwind (divs/spans that LOOK like mobile).
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
        return { ...screen, webCompatibleCode: processedWebCode, reactNativeCode: processedNativeCode, platform };
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
  const systemInstruction = `
    You are an expert Senior Developer.
    TASK: UPDATE the existing app based on: "${userPrompt}".
    Platform: ${currentApp.platform}.
    
    RULES:
    - FUNCTIONALITY: Implement logic fully. State updates, list rendering, simulated fetch.
    - UI BOOST: rounded-[28px], padded images, soft shadows.
    - AUTH: Implement Firebase Auth if config provided.
    - PAYMENTS: Implement RevenueCat (Real SDK) if key provided: "${revenueCatKey || ''}".
    - WEB: Use React DOM (div, span). NO React Native primitives.
    ${firebaseConfig ? `Config: ${firebaseConfig}` : ''}
  `;
  
  const parts: Part[] = [{ text: `CURRENT CODE:\n${currentApp.webCompatibleCode}\n\nREQUEST: "${userPrompt}"` }];
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

    return { ...result, webCompatibleCode: processedWebCode, reactNativeCode: processedNativeCode, platform: currentApp.platform, edgeFunctions: currentApp.edgeFunctions } as GeneratedApp;
  } catch (error) {
    console.error("Error editing app:", error);
    throw error;
  }
};
