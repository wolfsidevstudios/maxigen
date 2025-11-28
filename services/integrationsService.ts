

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'browser' | 'public_api' | 'mcp' | 'connected_app';
  contextPrompt: string;
  requiresKey?: boolean;
  keyUrl?: string;
  options?: { label: string; value: string }[];
}

export const BROWSER_APIS: Integration[] = [
  { id: 'geo', name: 'Geolocation API', description: 'Access user location (lat/long).', category: 'browser', contextPrompt: 'Use navigator.geolocation to get current position.' },
  { id: 'cam', name: 'Camera / MediaStream', description: 'Access camera and microphone.', category: 'browser', contextPrompt: 'Use navigator.mediaDevices.getUserMedia for camera/audio.' },
  { id: 'speech_rec', name: 'Speech Recognition', description: 'Convert voice to text.', category: 'browser', contextPrompt: 'Use window.SpeechRecognition or webkitSpeechRecognition.' },
  { id: 'speech_syn', name: 'Speech Synthesis', description: 'Text-to-speech engine.', category: 'browser', contextPrompt: 'Use window.speechSynthesis for TTS.' },
  { id: 'share', name: 'Web Share API', description: 'Native sharing dialog.', category: 'browser', contextPrompt: 'Use navigator.share() to open native share sheet.' },
  { id: 'vibrate', name: 'Vibration API', description: 'Haptic feedback.', category: 'browser', contextPrompt: 'Use navigator.vibrate() for haptics.' },
  { id: 'battery', name: 'Battery Status API', description: 'Check battery level.', category: 'browser', contextPrompt: 'Use navigator.getBattery().' },
  { id: 'online', name: 'Network Status', description: 'Check if user is online/offline.', category: 'browser', contextPrompt: 'Listen to window "online" and "offline" events.' },
  { id: 'storage', name: 'Local Storage', description: 'Persist data on device.', category: 'browser', contextPrompt: 'Use localStorage for data persistence.' },
  { id: 'indexeddb', name: 'IndexedDB', description: 'Large-scale local database.', category: 'browser', contextPrompt: 'Use IndexedDB for complex local data storage.' },
  { id: 'notif', name: 'Notifications API', description: 'System push notifications.', category: 'browser', contextPrompt: 'Request Notification.requestPermission() and create new Notification().' },
  { id: 'clipboard', name: 'Clipboard API', description: 'Copy/Paste functionality.', category: 'browser', contextPrompt: 'Use navigator.clipboard.writeText() and readText().' },
  { id: 'pip', name: 'Picture-in-Picture', description: 'Floating video player.', category: 'browser', contextPrompt: 'Use videoElement.requestPictureInPicture().' },
  { id: 'fullscreen', name: 'Fullscreen API', description: 'Full screen mode.', category: 'browser', contextPrompt: 'Use element.requestFullscreen().' },
  { id: 'orientation', name: 'Device Orientation', description: 'Gyroscope/Rotation data.', category: 'browser', contextPrompt: 'Listen for "deviceorientation" events.' },
  { id: 'motion', name: 'Device Motion', description: 'Accelerometer data.', category: 'browser', contextPrompt: 'Listen for "devicemotion" events.' },
  { id: 'bluetooth', name: 'Web Bluetooth', description: 'Connect to BLE devices.', category: 'browser', contextPrompt: 'Use navigator.bluetooth.requestDevice().' },
  { id: 'usb', name: 'Web USB', description: 'Connect to USB devices.', category: 'browser', contextPrompt: 'Use navigator.usb.requestDevice().' },
  { id: 'gamepad', name: 'Gamepad API', description: 'Controller input support.', category: 'browser', contextPrompt: 'Use navigator.getGamepads().' },
  { id: 'midi', name: 'Web MIDI', description: 'Musical Instrument Digital Interface.', category: 'browser', contextPrompt: 'Use navigator.requestMIDIAccess().' },
  { id: 'audio', name: 'Web Audio API', description: 'Complex audio synthesis/processing.', category: 'browser', contextPrompt: 'Use new AudioContext() for sound generation.' },
  { id: 'canvas', name: 'Canvas API', description: '2D Graphics drawing.', category: 'browser', contextPrompt: 'Use canvas.getContext("2d").' },
  { id: 'intersection', name: 'Intersection Observer', description: 'Detect when element is visible.', category: 'browser', contextPrompt: 'Use new IntersectionObserver().' },
  { id: 'resize', name: 'Resize Observer', description: 'Detect element size changes.', category: 'browser', contextPrompt: 'Use new ResizeObserver().' },
  { id: 'mutation', name: 'Mutation Observer', description: 'Detect DOM changes.', category: 'browser', contextPrompt: 'Use new MutationObserver().' },
  { id: 'broadcast', name: 'Broadcast Channel', description: 'Cross-tab communication.', category: 'browser', contextPrompt: 'Use new BroadcastChannel().' },
  { id: 'worker', name: 'Web Workers', description: 'Background threads.', category: 'browser', contextPrompt: 'Use new Worker().' },
  { id: 'socket', name: 'WebSockets', description: 'Real-time bidirectional comms.', category: 'browser', contextPrompt: 'Use new WebSocket().' },
  { id: 'crypto', name: 'Web Crypto API', description: 'Cryptographic functions.', category: 'browser', contextPrompt: 'Use crypto.subtle for encryption/hashing.' },
  { id: 'payment', name: 'Payment Request API', description: 'Native payment UI.', category: 'browser', contextPrompt: 'Use new PaymentRequest().' }
];

export const PUBLIC_APIS: Integration[] = [
  { id: 'meal', name: 'TheMealDB', description: 'Recipes and meals.', category: 'public_api', contextPrompt: 'Use https://www.themealdb.com/api/json/v1/1/ for recipes.' },
  { id: 'cocktail', name: 'TheCocktailDB', description: 'Drink recipes.', category: 'public_api', contextPrompt: 'Use https://www.thecocktaildb.com/api/json/v1/1/ for drinks.' },
  { id: 'poke', name: 'PokeAPI', description: 'Pokemon data.', category: 'public_api', contextPrompt: 'Use https://pokeapi.co/api/v2/ for Pokemon data.' },
  { id: 'restcountries', name: 'REST Countries', description: 'Country information.', category: 'public_api', contextPrompt: 'Use https://restcountries.com/v3.1/all for country data.' },
  { id: 'openlibrary', name: 'Open Library', description: 'Books and covers.', category: 'public_api', contextPrompt: 'Use https://openlibrary.org/dev/docs/api/search for books.' },
  { id: 'randomuser', name: 'Random User', description: 'Mock user data.', category: 'public_api', contextPrompt: 'Use https://randomuser.me/api/ for mock profiles.' },
  { id: 'dadjoke', name: 'Dad Jokes', description: 'Random dad jokes.', category: 'public_api', contextPrompt: 'Headers: {Accept: application/json}, URL: https://icanhazdadjoke.com/' },
  { id: 'numbers', name: 'Numbers API', description: 'Facts about numbers.', category: 'public_api', contextPrompt: 'Use http://numbersapi.com/ for number facts.' },
  { id: 'nasa', name: 'NASA APOD', description: 'Astronomy Picture of the Day.', category: 'public_api', contextPrompt: 'Use https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY' },
  { id: 'picsum', name: 'Lorem Picsum', description: 'Random placeholder images.', category: 'public_api', contextPrompt: 'Use https://picsum.photos/v2/list for images.' },
  { id: 'dog', name: 'Dog API', description: 'Random dog images.', category: 'public_api', contextPrompt: 'Use https://dog.ceo/api/breeds/image/random' },
  { id: 'cat', name: 'Cat Facts', description: 'Facts about cats.', category: 'public_api', contextPrompt: 'Use https://catfact.ninja/fact' },
  { id: 'bored', name: 'Bored API', description: 'Activity suggestions.', category: 'public_api', contextPrompt: 'Use https://www.boredapi.com/api/activity' },
  { id: 'agify', name: 'Agify.io', description: 'Predict age from name.', category: 'public_api', contextPrompt: 'Use https://api.agify.io?name=...' },
  { id: 'genderize', name: 'Genderize.io', description: 'Predict gender from name.', category: 'public_api', contextPrompt: 'Use https://api.genderize.io?name=...' },
  { id: 'nationalize', name: 'Nationalize.io', description: 'Predict nationality.', category: 'public_api', contextPrompt: 'Use https://api.nationalize.io?name=...' },
  { id: 'ipify', name: 'IPify', description: 'Get public IP.', category: 'public_api', contextPrompt: 'Use https://api.ipify.org?format=json' },
  { id: 'coindesk', name: 'CoinDesk', description: 'Bitcoin price index.', category: 'public_api', contextPrompt: 'Use https://api.coindesk.com/v1/bpi/currentprice.json' },
  { id: 'universities', name: 'Universities', description: 'List of universities.', category: 'public_api', contextPrompt: 'Use http://universities.hipolabs.com/search?country=...' },
  { id: 'zip', name: 'Zippopotam', description: 'Zip code info.', category: 'public_api', contextPrompt: 'Use http://api.zippopotam.us/us/90210' },
  { id: 'frankfurter', name: 'Frankfurter', description: 'Currency exchange rates.', category: 'public_api', contextPrompt: 'Use https://api.frankfurter.app/latest' },
  { id: 'lyrics', name: 'Lyrics.ovh', description: 'Song lyrics.', category: 'public_api', contextPrompt: 'Use https://api.lyrics.ovh/v1/artist/title' },
  { id: 'tvmaze', name: 'TV Maze', description: 'TV Show info.', category: 'public_api', contextPrompt: 'Use https://api.tvmaze.com/search/shows?q=...' },
  { id: 'openbrewery', name: 'Open Brewery', description: 'Breweries list.', category: 'public_api', contextPrompt: 'Use https://api.openbrewerydb.org/breweries' },
  { id: 'advice', name: 'Advice Slip', description: 'Random advice.', category: 'public_api', contextPrompt: 'Use https://api.adviceslip.com/advice' },
  { id: 'funtrans', name: 'Fun Translations', description: 'Yoda/Pirate speak.', category: 'public_api', contextPrompt: 'Use https://api.funtranslations.com/translate/...' },
  { id: 'marvel', name: 'Marvel (Public Key)', description: 'Comic data.', category: 'public_api', contextPrompt: 'Requires generating hash. Prefer simpler APIs unless requested.' },
  { id: 'rickmorty', name: 'Rick and Morty', description: 'Character data.', category: 'public_api', contextPrompt: 'Use https://rickandmortyapi.com/api/character' },
  { id: 'dict', name: 'Dictionary API', description: 'Word definitions.', category: 'public_api', contextPrompt: 'Use https://api.dictionaryapi.dev/api/v2/entries/en/hello' },
  { id: 'quotes', name: 'Quotable', description: 'Famous quotes.', category: 'public_api', contextPrompt: 'Use https://api.quotable.io/random' },
  { id: 'makeup', name: 'Makeup API', description: 'Cosmetic products.', category: 'public_api', contextPrompt: 'Use http://makeup-api.herokuapp.com/api/v1/products.json' },
  { id: 'f1', name: 'Ergast F1', description: 'Formula 1 data.', category: 'public_api', contextPrompt: 'Use http://ergast.com/api/f1/current.json' },
  { id: 'coincap', name: 'CoinCap', description: 'Crypto market data.', category: 'public_api', contextPrompt: 'Use https://api.coincap.io/v2/assets' },
  { id: '7timer', name: '7Timer', description: 'Weather forecast.', category: 'public_api', contextPrompt: 'Use http://www.7timer.info/bin/api.pl' },
  { id: 'art', name: 'Art Institute Chicago', description: 'Artworks.', category: 'public_api', contextPrompt: 'Use https://api.artic.edu/api/v1/artworks' },
  { id: 'jikan', name: 'Jikan (MAL)', description: 'Anime/Manga info.', category: 'public_api', contextPrompt: 'Use https://api.jikan.moe/v4/anime' },
  { id: 'gutendex', name: 'Gutendex', description: 'Project Gutenberg books.', category: 'public_api', contextPrompt: 'Use https://gutendex.com/books' },
  { id: 'deck', name: 'Deck of Cards', description: 'Card game logic.', category: 'public_api', contextPrompt: 'Use https://deckofcardsapi.com/api/deck/new/shuffle/' },
  { id: 'xkcd', name: 'XKCD', description: 'Comics.', category: 'public_api', contextPrompt: 'Use https://xkcd.com/info.0.json' },
  { id: 'trefle', name: 'Trefle', description: 'Plants (Check key).', category: 'public_api', contextPrompt: 'Skip if key needed.' },
  { id: 'punk', name: 'Punk API', description: 'Beer recipes.', category: 'public_api', contextPrompt: 'Use https://api.punkapi.com/v2/beers' },
  { id: 'opendota', name: 'OpenDota', description: 'Dota 2 stats.', category: 'public_api', contextPrompt: 'Use https://api.opendota.com/api/matches/...' },
  { id: 'studio', name: 'Studio Ghibli', description: 'Ghibli films.', category: 'public_api', contextPrompt: 'Use https://ghibliapi.vercel.app/films' },
  { id: 'hp', name: 'Harry Potter', description: 'HP spells/characters.', category: 'public_api', contextPrompt: 'Use https://hp-api.onrender.com/api/characters' },
  { id: 'got', name: 'Game of Thrones', description: 'GoT characters.', category: 'public_api', contextPrompt: 'Use https://thronesapi.com/api/v2/Characters' },
  { id: 'amiibo', name: 'AmiiboAPI', description: 'Nintendo Amiibos.', category: 'public_api', contextPrompt: 'Use https://www.amiiboapi.com/api/amiibo/' },
  { id: 'sun', name: 'Sunrise/Sunset', description: 'Solar times.', category: 'public_api', contextPrompt: 'Use https://api.sunrise-sunset.org/json?lat=...&lng=...' },
  { id: 'wger', name: 'Wger Workout', description: 'Exercises.', category: 'public_api', contextPrompt: 'Use https://wger.de/api/v2/exercise/' },
  { id: 'animechan', name: 'AnimeChan', description: 'Anime quotes.', category: 'public_api', contextPrompt: 'Use https://animechan.xyz/api/random' },
  { id: 'met', name: 'Met Museum', description: 'Museum objects.', category: 'public_api', contextPrompt: 'Use https://collectionapi.metmuseum.org/public/collection/v1/objects' }
];

export const CONNECTED_APPS: Integration[] = [
    { id: 'revenuecat', name: 'RevenueCat', description: 'In-app subscriptions and purchases.', category: 'connected_app', requiresKey: true, keyUrl: 'https://app.revenuecat.com/settings/api_keys', contextPrompt: 'Use @revenuecat/purchases-js for Web or react-native-purchases for Mobile. Initialize Purchases with the API key. Fetch offerings and display paywall.' },
    { id: 'gemini', name: 'Google Gemini', description: 'Integrate Gemini models for AI features.', category: 'connected_app', requiresKey: true, keyUrl: 'https://aistudio.google.com/app/apikey', contextPrompt: 'Use GoogleGenAI SDK. Initialize with provided API key.', options: [ { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' }, { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' }, { label: 'Gemini 3.0 Pro', value: 'gemini-3.0-pro' } ] },
    { id: 'openai', name: 'OpenAI', description: 'GPT-4 and DALL-E models.', category: 'connected_app', requiresKey: true, keyUrl: 'https://platform.openai.com/api-keys', contextPrompt: 'Use OpenAI API via fetch("https://api.openai.com/v1/...") with bearer token.' },
    { id: 'supabase', name: 'Supabase', description: 'Postgres DB, Auth, Realtime.', category: 'connected_app', requiresKey: true, keyUrl: 'https://supabase.com/dashboard/project/_/settings/api', contextPrompt: 'Use Supabase JS client or fetch calls to Supabase URL.' },
    { id: 'firebase', name: 'Firebase', description: 'Google Auth, Firestore, Storage.', category: 'connected_app', requiresKey: true, keyUrl: 'https://console.firebase.google.com/', contextPrompt: 'Initialize Firebase app with config object.' },
    { id: 'stripe', name: 'Stripe', description: 'Payments infrastructure.', category: 'connected_app', requiresKey: true, keyUrl: 'https://dashboard.stripe.com/apikeys', contextPrompt: 'Use Stripe.js for frontend payments.' },
    { id: 'twilio', name: 'Twilio', description: 'SMS, Voice, and Video.', category: 'connected_app', requiresKey: true, keyUrl: 'https://console.twilio.com/', contextPrompt: 'Use Twilio API for communication.' },
    { id: 'resend', name: 'Resend', description: 'Email delivery service.', category: 'connected_app', requiresKey: true, keyUrl: 'https://resend.com/api-keys', contextPrompt: 'Use Resend API to send emails.' },
    { id: 'algolia', name: 'Algolia', description: 'Fast search APIs.', category: 'connected_app', requiresKey: true, keyUrl: 'https://dashboard.algolia.com/account/api-keys', contextPrompt: 'Use Algolia Search client.' },
    { id: 'mapbox', name: 'Mapbox', description: 'Custom maps and location.', category: 'connected_app', requiresKey: true, keyUrl: 'https://account.mapbox.com/', contextPrompt: 'Use Mapbox GL JS.' },
    { id: 'replicate', name: 'Replicate', description: 'Run AI models in cloud.', category: 'connected_app', requiresKey: true, keyUrl: 'https://replicate.com/account/api-tokens', contextPrompt: 'Call Replicate API for ML models.' },
    { id: 'clerk', name: 'Clerk', description: 'Authentication and User Mgmt.', category: 'connected_app', requiresKey: true, keyUrl: 'https://dashboard.clerk.com/', contextPrompt: 'Use Clerk React SDK.' }
];

export const MCP_INTEGRATIONS: Integration[] = [
    { id: 'mcp-fs', name: 'Filesystem', description: 'Read/Write access to local filesystem.', category: 'mcp', contextPrompt: 'Assume access to a Filesystem MCP server (listing, reading, writing files).' },
    { id: 'mcp-git', name: 'Git', description: 'Git repository operations.', category: 'mcp', contextPrompt: 'Assume access to a Git MCP server (commit, push, log, diff).' },
    { id: 'mcp-github', name: 'GitHub', description: 'GitHub API integration.', category: 'mcp', contextPrompt: 'Assume access to GitHub MCP server (issues, prs, search).' },
    { id: 'mcp-postgres', name: 'PostgreSQL', description: 'Postgres database query tool.', category: 'mcp', contextPrompt: 'Assume access to PostgreSQL MCP server for SQL queries.' },
    { id: 'mcp-sqlite', name: 'SQLite', description: 'Local SQLite database management.', category: 'mcp', contextPrompt: 'Assume access to SQLite MCP server for database operations.' },
    { id: 'mcp-slack', name: 'Slack', description: 'Send/Read Slack messages.', category: 'mcp', contextPrompt: 'Assume access to Slack MCP server for channel communication.' },
    { id: 'mcp-sentry', name: 'Sentry', description: 'Error tracking and monitoring.', category: 'mcp', contextPrompt: 'Assume access to Sentry MCP server for issue tracking.' },
    { id: 'mcp-brave', name: 'Brave Search', description: 'Web search via Brave.', category: 'mcp', contextPrompt: 'Assume access to Brave Search MCP for web queries.' },
    { id: 'mcp-gmaps', name: 'Google Maps', description: 'Location and places data.', category: 'mcp', contextPrompt: 'Assume access to Google Maps MCP server.' },
    { id: 'mcp-gdrive', name: 'Google Drive', description: 'File management on Drive.', category: 'mcp', contextPrompt: 'Assume access to Google Drive MCP server.' },
    { id: 'mcp-linear', name: 'Linear', description: 'Issue tracking for software teams.', category: 'mcp', contextPrompt: 'Assume access to Linear MCP for task management.' },
    { id: 'mcp-jira', name: 'Jira', description: 'Project management via Jira.', category: 'mcp', contextPrompt: 'Assume access to Jira MCP server.' },
    { id: 'mcp-notion', name: 'Notion', description: 'Notion pages and databases.', category: 'mcp', contextPrompt: 'Assume access to Notion MCP server.' },
    { id: 'mcp-puppeteer', name: 'Puppeteer', description: 'Headless browser automation.', category: 'mcp', contextPrompt: 'Assume access to Puppeteer MCP for web scraping/testing.' },
    { id: 'mcp-sequential', name: 'Sequential Thinking', description: 'Advanced reasoning steps.', category: 'mcp', contextPrompt: 'Use Sequential Thinking MCP for complex problem solving.' },
    { id: 'mcp-time', name: 'Time', description: 'Time and timezone utilities.', category: 'mcp', contextPrompt: 'Use Time MCP for timezone calculations.' },
    { id: 'mcp-weather', name: 'Weather', description: 'Real-time weather data.', category: 'mcp', contextPrompt: 'Use Weather MCP for forecasts.' },
    { id: 'mcp-memory', name: 'Memory', description: 'Persistent memory storage.', category: 'mcp', contextPrompt: 'Use Memory MCP to store user preferences/facts.' },
    { id: 'mcp-everything', name: 'Everything', description: 'Desktop file search.', category: 'mcp', contextPrompt: 'Use Everything MCP for fast local file search.' },
    { id: 'mcp-stripe', name: 'Stripe', description: 'Payment processing status.', category: 'mcp', contextPrompt: 'Assume access to Stripe MCP for transaction data.' },
    { id: 'mcp-obsidian', name: 'Obsidian', description: 'Markdown note management.', category: 'mcp', contextPrompt: 'Assume access to Obsidian MCP vault.' },
    { id: 'mcp-discord', name: 'Discord', description: 'Discord bot integration.', category: 'mcp', contextPrompt: 'Assume access to Discord MCP server.' },
    { id: 'mcp-vercel', name: 'Vercel', description: 'Deployment management.', category: 'mcp', contextPrompt: 'Assume access to Vercel MCP for deployments.' },
    { id: 'mcp-aws', name: 'AWS', description: 'AWS resource management.', category: 'mcp', contextPrompt: 'Assume access to AWS MCP for cloud resources.' },
    { id: 'mcp-cloudflare', name: 'Cloudflare', description: 'DNS and worker management.', category: 'mcp', contextPrompt: 'Assume access to Cloudflare MCP.' },
    { id: 'mcp-docker', name: 'Docker', description: 'Container management.', category: 'mcp', contextPrompt: 'Assume access to Docker MCP for container ops.' }
];