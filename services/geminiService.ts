import { GoogleGenAI, Type, Schema, Part, Tool } from "@google/genai";
import { GeneratedApp, Platform, GenerationMode } from "../types";
import { processCodeWithMedia } from "./mediaService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for a single app screen (used for Editing)
const singleAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    reactNativeCode: {
      type: Type.STRING,
      description: "The production-ready source code. If Platform is Mobile: React Native code. If Platform is Web: Standard React + Tailwind code (export default App).",
    },
    webCompatibleCode: {
      type: Type.STRING,
      description: "A functional React component for the iframe preview. DO NOT use imports. DO NOT use 'export default'. Define the main component GLOBALLY as 'const App = () => { ... }' or 'function App() { ... }'. Access icons via 'const { IconName } = LucideReact'. Use standard HTML tags (div, span, button) styled with Tailwind CSS.",
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
      description: "A beautiful, modern, colorful SVG string (<svg>...</svg>) representing this app. Do not include '```xml' tags. Just the raw SVG code. Size 24x24.",
    }
  },
  required: ["reactNativeCode", "webCompatibleCode", "explanation", "name", "icon"],
};

// Schema for multiple app screens (used for New Generations)
const multiAppSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    screens: {
      type: Type.ARRAY,
      description: "A list of app screens/pages.",
      items: singleAppSchema
    },
    projectExplanation: {
      type: Type.STRING,
      description: "A summary of the entire generated project.",
    }
  },
  required: ["screens", "projectExplanation"],
};

export const generateAppCode = async (
    prompt: string, 
    platform: Platform, 
    image?: string,
    mode: GenerationMode = 'default',
    referenceUrl?: string
): Promise<{ screens: GeneratedApp[], explanation: string, sources?: {title: string, uri: string}[] }> => {
  
  const commonRules = `
    You are an expert Senior Developer and UI/UX Designer.
    Your goal is to build production-ready applications.
    
    Standard Design Requirements (Unless Overridden by 'Copy' mode):
    - Theme: Modern White Theme. Clean, minimalist.
    - Colors: Black (#000000) primary, White (#ffffff) background, Zinc (#f4f4f5) accents.
    - Buttons: "Pill shaped" (rounded-full).
    - Aesthetic: "Apple-like", premium, "AI vibe".
    
    MEDIA & IMAGES (CRITICAL):
    - NEVER use generic placeholder URLs like 'via.placeholder.com' or 'example.com/image.jpg'.
    - Use this SPECIAL FORMAT to request real media:
       - Images: "https://maxigen.media/image?q=SEARCH_TERM"  (e.g., "https://maxigen.media/image?q=coffee shop interior")
       - GIFs:   "https://maxigen.media/gif?q=SEARCH_TERM"    (e.g., "https://maxigen.media/gif?q=loading animation")
       - Videos: "https://maxigen.media/video?q=SEARCH_TERM"  (e.g., "https://maxigen.media/video?q=nature relaxation")
    - For Web Apps: Ensure layouts are SCROLLABLE. Use 'min-h-screen', 'overflow-y-auto', and plenty of content sections (Hero, Features, Testimonials, Footer) populated with these real images.
    
    For EACH screen, you need to generate:
    1. 'reactNativeCode': The copy-pasteable PRODUCTION code.
    2. 'webCompatibleCode': The PREVIEW code for our internal iframe simulator.
    3. 'icon': A unique, beautiful SVG icon for the app.
  `;

  const mobileInstructions = `
    PLATFORM: MOBILE (React Native / Expo)
    - Valid Expo React Native code (TypeScript). 
    - Use 'lucide-react-native' for icons.
    - Use 'StyleSheet', 'View', 'Text', 'TouchableOpacity', 'ScrollView', 'SafeAreaView'.
    - Must export default App.
    - Preview code: VISUAL SIMULATION using React DOM + Tailwind. NO IMPORTS. Define 'const App = ...' globally.
  `;

  const webInstructions = `
    PLATFORM: WEB (React + Tailwind)
    - Standard React Functional Component.
    - Use Tailwind CSS classes for styling.
    - 'export default function App() { ... }'
    - Preview code: NO IMPORTS. Define 'const App = ...' globally.
    - LAYOUT: Ensure the page is long enough to scroll. Add padding, large images, and distinct sections.
  `;

  let modeSpecificInstructions = "";
  let modelName = "gemini-2.5-flash"; // Default model
  let tools: Tool[] | undefined = undefined;
  let useJsonSchema = true;

  if (mode === 'redesign') {
      modeSpecificInstructions = `
        MODE: REDESIGN
        The user has provided a screenshot/image or a URL of an existing app/website.
        Your task is to REDESIGN it to be significantly better, cleaner, and more modern.
        
        ${referenceUrl ? `Reference URL: ${referenceUrl}` : ''}
        
        1. Analyze the structure and functionality of the input.
        2. Keep the core features/content.
        3. UPGRADE the UI: Better spacing, modern typography, cleaner hierarchy, pill-shaped buttons.
        4. Fix any obvious UX flaws.
      `;
  } else if (mode === 'copy') {
      modeSpecificInstructions = `
        MODE: COPY & DESIGN
        The user has provided a reference design (Screenshot or URL) and a description of *their* new app.
        
        ${referenceUrl ? `Reference Style URL: ${referenceUrl}` : ''}
        
        1. EXTRACT the "Design System" from the reference image/URL (Colors, Fonts, Button Styles, Spacing, Border Radius, Shadows).
        2. IGNORE the content of the reference image.
        3. Apply that EXACT Design System to build the NEW app described in the prompt: "${prompt}".
        
        Example: If the reference image is "Spotify" (Dark mode, green accents), and the prompt is "A recipe app", build a Dark Mode Recipe App with green accents.
      `;
  } else if (mode === 'agentic') {
      // AGENTIC MODE CONFIGURATION
      modelName = "gemini-2.0-flash-exp"; 
      tools = [{ googleSearch: {} }]; // Enable Search Grounding
      useJsonSchema = false; // Disable strict schema when using Search
      
      modeSpecificInstructions = `
        MODE: AGENTIC (RESEARCH & DESIGN)
        Act as a WORLD-CLASS UI/UX Researcher and Architect.
        
        1. SEARCH GROUNDING: Use Google Search to find the absolute BEST real-world examples, design patterns, and case studies related to: "${prompt}".
        2. ANALYZE: Read the search results to understand current trends, user expectations, and innovative features.
        3. SYNTHESIZE: Combine these findings to design an app that is "Above and Beyond".
        4. OUTPUT: You MUST return a VALID JSON object matching the standard schema provided below. Do not wrap it in markdown. Just the raw JSON.
        
        Schema Structure required:
        {
          "screens": [ ... ],
          "projectExplanation": "..."
        }
      `;
  } else {
      modeSpecificInstructions = `
        MODE: GENERATE (Default)
        Build the app described in the prompt: "${prompt}".
        ${image ? 'Use the attached image as a layout sketch or inspiration.' : ''}
      `;
  }

  const systemInstruction = `
    ${commonRules}
    ${platform === 'web' ? webInstructions : mobileInstructions}
    
    ${modeSpecificInstructions}
    
    CAPABILITY UPDATE: You can generate WHOLE APPS. 
    - If the user asks for "a fitness app", generate multiple screens: e.g., "Welcome Screen", "Dashboard", "Workout View".
  `;

  const parts: Part[] = [{ text: prompt }];

  if (image) {
      parts.push({
          inlineData: {
              mimeType: 'image/png',
              data: image
          }
      });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        systemInstruction,
        // Only apply strict JSON schema if NOT in Agentic mode (because Agentic uses Tools)
        responseMimeType: useJsonSchema ? "application/json" : undefined,
        responseSchema: useJsonSchema ? multiAppSchema : undefined,
        tools: tools,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 60000 // Increase token limit to prevent truncated JSON
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    // Agentic Mode Handling: Extract JSON from potential Markdown text
    if (mode === 'agentic' || !useJsonSchema) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            text = jsonMatch[0];
        } else {
            // Fallback: try to find start of json
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1) {
                text = text.substring(startIndex, endIndex + 1);
            }
        }
    }

    // Attempt to parse
    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error("JSON Parse failed. Attempting repair.", e);
        // Simple repair: if it looks cut off at the end
        if (text.trim().endsWith('"')) text += ']}'; 
        else if (text.trim().endsWith('}')) { /* ok */ }
        else text += '"}'; // Blind attempt
        data = JSON.parse(text);
    }
    
    // --- MEDIA PROCESSING STEP ---
    const processedScreens = await Promise.all((data.screens as any[]).map(async (screen) => {
        const processedWebCode = await processCodeWithMedia(screen.webCompatibleCode);
        const processedNativeCode = await processCodeWithMedia(screen.reactNativeCode);
        
        return {
            ...screen,
            webCompatibleCode: processedWebCode,
            reactNativeCode: processedNativeCode,
            platform
        };
    }));

    // Extract Grounding Metadata (Sources)
    let sources: { title: string, uri: string }[] | undefined;
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        sources = response.candidates[0].groundingMetadata.groundingChunks
            .map((chunk: any) => chunk.web ? { title: chunk.web.title, uri: chunk.web.uri } : null)
            .filter((s: any) => s !== null);
    }

    return {
        screens: processedScreens as GeneratedApp[],
        explanation: data.projectExplanation as string,
        sources
    };

  } catch (error) {
    console.error("Error generating app:", error);
    throw error;
  }
};

export const editAppCode = async (currentApp: GeneratedApp, userPrompt: string, image?: string): Promise<GeneratedApp> => {
  const systemInstruction = `
    You are an expert Senior Developer. 
    You are tasked with REDESIGNING an app screen based on a user request and visual annotations.
    Platform: ${currentApp.platform === 'web' ? 'WEB (React + Tailwind)' : 'MOBILE (React Native)'}.
    
    IMPORTANT: 
    - Do NOT feel constrained by the exact structure of the previous code. 
    - You are free to COMPLETELY REWRITE the component to best fit the user's new request.
    - Treat this as a "Version 2.0" or a "Redesign" rather than a small patch.
    - If the user draws a box and says "add a chart here", redesign the layout to elegantly accommodate that chart.
    
    Design Aesthetic: Modern White, Pill buttons, Premium feel.
    
    MEDIA INSTRUCTIONS:
    - Use "https://maxigen.media/image?q=..." for images.
    - Use "https://maxigen.media/video?q=..." for video.
    
    If an image is provided:
    - It is a screenshot with annotations (red drawings, boxes).
    - Use these visual cues to understand WHERE to place elements or WHAT to change.
    
    Adhere to syntax rules:
    - Preview Code: NO imports, const App = () => {}, use LucideReact global.
    - Production Code: Valid full source code.
  `;

  const promptText = `
    CURRENT APP NAME: ${currentApp.name}
    
    OLD CODE REFERENCE (For Context Only):
    ${currentApp.webCompatibleCode}
    
    USER REQUEST:
    "${userPrompt}"
    
    Generate the completely new/updated full JSON response.
  `;

  const parts: Part[] = [{ text: promptText }];
  
  if (image) {
    parts.push({
        inlineData: {
            mimeType: 'image/png',
            data: image
        }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: singleAppSchema, 
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 60000 
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text);
    
    // Process media in edited code
    const processedWebCode = await processCodeWithMedia(result.webCompatibleCode);
    const processedNativeCode = await processCodeWithMedia(result.reactNativeCode);

    return { 
        ...result, 
        webCompatibleCode: processedWebCode,
        reactNativeCode: processedNativeCode,
        platform: currentApp.platform 
    } as GeneratedApp;
  } catch (error) {
    console.error("Error editing app:", error);
    throw error;
  }
};