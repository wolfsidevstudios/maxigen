
import { GeneratedApp } from '../types';

export type WidgetType = 'timer' | 'weather' | 'builder' | 'note';

export interface WidgetData {
  id: string;
  type: WidgetType;
  data: any;
}

export interface CommandResult {
    text: string;
    action?: {
        type: 'NAVIGATE' | 'VIEW_MODE' | 'ZOOM' | 'PROMPT' | 'PROJECT' | 'AUTH';
        payload?: any;
    };
}

// Open-Meteo Weather Service (No Key Required)
const getWeather = async (city: string) => {
  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();
    
    if (!geoData.results || geoData.results.length === 0) return null;
    
    const { latitude, longitude, name } = geoData.results[0];

    // 2. Weather Data
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`);
    const weatherData = await weatherRes.json();

    return {
      city: name,
      temp: weatherData.current.temperature_2m,
      code: weatherData.current.weather_code
    };
  } catch (e) {
    console.error("Weather Error", e);
    return null;
  }
};

export const processVoiceCommand = async (
    transcript: string, 
    addWidget: (w: WidgetData) => void,
    triggerBuild: (prompt: string) => void
): Promise<CommandResult | "AI_PROCESS_NEEDED"> => {
    const text = transcript.toLowerCase();

    // --- 1. NAVIGATION COMMANDS ---
    if (text.match(/(go to|open|show|view)\s+(settings|config)/)) {
        return { text: "Opening settings.", action: { type: 'NAVIGATE', payload: 'settings' } };
    }
    if (text.match(/(go to|open|show|view)\s+(projects|my apps|library)/)) {
        return { text: "Here are your projects.", action: { type: 'NAVIGATE', payload: 'projects' } };
    }
    if (text.match(/(go to|open|show|view)\s+(templates|gallery)/)) {
        return { text: "Opening templates gallery.", action: { type: 'NAVIGATE', payload: 'templates' } };
    }
    if (text.match(/(go|back)\s+(home|dashboard)/)) {
        return { text: "Taking you home.", action: { type: 'NAVIGATE', payload: 'home' } };
    }
    if (text.match(/(go to|open)\s+(builder|editor|build)/)) {
        return { text: "Opening the builder.", action: { type: 'NAVIGATE', payload: 'build' } };
    }

    // --- 2. VIEW MODES ---
    if (text.match(/(switch to|show|view)\s+(code|source)/)) {
        return { text: "Switching to code view.", action: { type: 'VIEW_MODE', payload: 'code' } };
    }
    if (text.match(/(switch to|show|view)\s+(preview|mobile|web)/)) {
        return { text: "Switching to preview.", action: { type: 'VIEW_MODE', payload: 'preview' } };
    }
    if (text.match(/(switch to|show|view)\s+(deploy|publish)/)) {
        return { text: "Opening deployment options.", action: { type: 'VIEW_MODE', payload: 'deploy' } };
    }

    // --- 3. EDITOR ACTIONS ---
    if (text.match(/(zoom in|enhance|bigger)/)) {
        return { text: "Zooming in.", action: { type: 'ZOOM', payload: 'in' } };
    }
    if (text.match(/(zoom out|smaller)/)) {
        return { text: "Zooming out.", action: { type: 'ZOOM', payload: 'out' } };
    }
    if (text.match(/(reset|fit)\s+(view|zoom|screen)/)) {
        return { text: "Resetting view.", action: { type: 'ZOOM', payload: 'reset' } };
    }
    if (text.match(/(new|create)\s+(project|app)/) || text.includes('start over')) {
        return { text: "Starting a new project.", action: { type: 'PROJECT', payload: 'new' } };
    }
    if (text.match(/(log out|sign out)/)) {
        return { text: "Logging you out.", action: { type: 'AUTH', payload: 'logout' } };
    }

    // --- 4. LAZY PROMPTS (Automated Coding Requests) ---
    // Fixes
    if (text.includes('fix') && (text.includes('bug') || text.includes('error') || text.includes('issue'))) {
        return { 
            text: "On it. I'm analyzing the code to fix issues.", 
            action: { type: 'PROMPT', payload: "Debug this code. Fix any console errors, layout overflow issues, and ensure type safety. Keep the functionality the same." } 
        };
    }
    // Beautify
    if (text.includes('make it') && (text.includes('pretty') || text.includes('better') || text.includes('modern') || text.includes('cool'))) {
        return { 
            text: "Let's make it shine. Applying modern design principles.", 
            action: { type: 'PROMPT', payload: "Redesign the UI to be ultra-modern. Use a 'Glassmorphism' aesthetic with backdrop-blur, rounded-3xl corners, and a clean dark mode palette. Improve padding and typography." } 
        };
    }
    // Dark Mode
    if (text.includes('dark mode')) {
        return {
            text: "Switching to dark mode.",
            action: { type: 'PROMPT', payload: "Convert the entire application to Dark Mode. Use zinc-950 for backgrounds, white for text, and subtle borders." }
        };
    }
    // Auth
    if (text.includes('add') && (text.includes('login') || text.includes('auth') || text.includes('sign up'))) {
        return {
            text: "Adding an authentication flow.",
            action: { type: 'PROMPT', payload: "Add a modern Login and Sign Up screen. Use Firebase Auth if configured, otherwise create a simulated auth flow with state management. Style it elegantly." }
        };
    }

    // --- 5. TIMER COMMAND ---
    const unitPattern = "(m|min|mins|minute|minutes|s|sec|secs|second|seconds|h|hr|hrs|hour|hours)";
    const timerRegex1 = new RegExp(`(?:set|start)?\\s*(?:a)?\\s*timer.*(?:for)?\\s+(\\d+)\\s*${unitPattern}`);
    const timerRegex2 = new RegExp(`(\\d+)\\s*${unitPattern}.*timer`);

    const timerMatch = text.match(timerRegex1) || text.match(timerRegex2);
    
    if (timerMatch) {
        const amount = parseInt(timerMatch[1]);
        let unit = timerMatch[2];
        
        if (unit.startsWith('m')) unit = 'minute';
        else if (unit.startsWith('s')) unit = 'second';
        else if (unit.startsWith('h')) unit = 'hour';

        let duration = 0;
        if (unit === 'minute') duration = amount * 60;
        if (unit === 'second') duration = amount;
        if (unit === 'hour') duration = amount * 3600;

        addWidget({
            id: Date.now().toString(),
            type: 'timer',
            data: { duration, initial: duration }
        });
        return { text: `Starting a timer for ${amount} ${unit}s.` };
    }

    // --- 6. WEATHER COMMAND ---
    const weatherMatch = text.match(/(?:weather|temperature).*in\s+(.+)/);
    if (weatherMatch) {
        const city = weatherMatch[1].replace('?', '').replace('like', '').trim();
        const data = await getWeather(city);
        
        if (data) {
            addWidget({
                id: Date.now().toString(),
                type: 'weather',
                data: data
            });
            return { text: `It is currently ${data.temp} degrees in ${data.city}.` };
        } else {
            return { text: `I couldn't find weather data for ${city}.` };
        }
    }

    // --- 7. BUILD APP COMMAND (Background) ---
    if (text.includes('build an app') || text.includes('generate an app') || text.includes('create an app') || text.includes('make an app')) {
        const prompt = text.replace(/.*(?:app|application)\s+(?:about|for|that|where)\s+/, '') || "A new cool app";
        triggerBuild(prompt);
        addWidget({
            id: Date.now().toString(),
            type: 'builder',
            data: { prompt, status: 'building' }
        });
        return { text: `I've started building your app about ${prompt}. Check the widget for updates.` };
    }

    return "AI_PROCESS_NEEDED";
};
