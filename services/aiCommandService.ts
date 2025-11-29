
import { GeneratedApp } from '../types';

export type WidgetType = 'timer' | 'weather' | 'builder' | 'note';

export interface WidgetData {
  id: string;
  type: WidgetType;
  data: any;
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
): Promise<string> => {
    const text = transcript.toLowerCase();

    // --- 1. TIMER COMMAND ---
    // Expanded Regex to catch: "start a 2 min timer", "set timer for 5 minutes", "timer 10s"
    
    // Pattern A: "timer for 10 minutes"
    const unitPattern = "(m|min|mins|minute|minutes|s|sec|secs|second|seconds|h|hr|hrs|hour|hours)";
    const timerRegex1 = new RegExp(`(?:set|start)?\\s*(?:a)?\\s*timer.*(?:for)?\\s+(\\d+)\\s*${unitPattern}`);
    
    // Pattern B: "10 minute timer"
    const timerRegex2 = new RegExp(`(\\d+)\\s*${unitPattern}.*timer`);

    const timerMatch = text.match(timerRegex1) || text.match(timerRegex2);
    
    if (timerMatch) {
        const amount = parseInt(timerMatch[1]);
        let unit = timerMatch[2];
        
        // Normalize unit
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
        return `Starting a timer for ${amount} ${unit}s.`;
    }

    // --- 2. WEATHER COMMAND ---
    // Matches: "weather in London", "what's the weather like in Paris"
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
            return `It is currently ${data.temp} degrees in ${data.city}.`;
        } else {
            return `I couldn't find weather data for ${city}.`;
        }
    }

    // --- 3. BUILD APP COMMAND ---
    // Matches: "build an app about...", "generate an app for..."
    if (text.includes('build an app') || text.includes('generate an app') || text.includes('create an app') || text.includes('make an app')) {
        // Extract the prompt (simple split for now)
        const prompt = text.replace(/.*(?:app|application)\s+(?:about|for|that|where)\s+/, '') || "A new cool app";
        
        // Notify parent to start build
        triggerBuild(prompt);
        
        addWidget({
            id: Date.now().toString(),
            type: 'builder',
            data: { prompt, status: 'building' }
        });
        
        return `I've started building your app about ${prompt}. Check the widget for updates.`;
    }

    return "AI_PROCESS_NEEDED";
};
