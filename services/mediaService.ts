
// API KEYS provided by user
const PEXELS_KEY = '8Mh8jDK5VAgGnnmNYO2k0LqdaLL8lbIR4ou5Vnd8Zod0cETWahEx1MKf';
const GIPHY_KEY = 'ME9EvE0WD0TeXUxVQ7aKG9UlgRiUEgDO';
const YOUTUBE_KEY = 'AIzaSyBBf9TIeqt8izcMBTf0Emr_sbum4cPXjlU';
const FREEIMAGE_KEY = '6d207e02198a847aa98d0a2a901485a5';

// --- UPLOAD HELPER ---

async function uploadToHost(imageUrl: string): Promise<string> {
  try {
    // Attempt to upload the image URL to FreeImage.host
    const formData = new FormData();
    formData.append('key', FREEIMAGE_KEY);
    formData.append('action', 'upload');
    formData.append('source', imageUrl);
    formData.append('format', 'json');

    const res = await fetch('https://freeimage.host/api/1/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
        return imageUrl;
    }
    
    const data = await res.json();
    return data.image?.url || imageUrl;
  } catch (e) {
    return imageUrl; // Fallback to original if upload fails
  }
}

// --- FETCH FUNCTIONS ---

async function fetchPexelsImage(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
      headers: { Authorization: PEXELS_KEY }
    });
    if (!res.ok) throw new Error("Pexels error");
    const data = await res.json();
    return data.photos?.[0]?.src?.landscape || null;
  } catch (e) {
    console.warn("Pexels fetch failed:", e);
    return null;
  }
}

async function fetchGiphyGif(query: string): Promise<string | null> {
  try {
    const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=1`);
    if (!res.ok) throw new Error("Giphy error");
    const data = await res.json();
    return data.data?.[0]?.images?.original?.url || null;
  } catch (e) {
    console.warn("Giphy fetch failed:", e);
    return null;
  }
}

async function fetchYouTubeVideo(query: string): Promise<string | null> {
  try {
    // Search for video snippets, type=video, videoEmbeddable=true
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_KEY}&type=video&videoEmbeddable=true&maxResults=1`);
    
    if (!res.ok) {
        const errText = await res.text();
        console.error("YouTube API Error:", errText);
        throw new Error("YouTube API error");
    }
    
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    
    if (!videoId) {
        console.warn(`No YouTube video found for query: ${query}`);
        return null;
    }
    
    // Use standard YouTube embed URL format
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (e) {
    console.warn("YouTube fetch failed:", e);
    return null;
  }
}

// --- MAIN PROCESSOR ---

export async function processCodeWithMedia(code: string): Promise<string> {
  // Regex to find placeholders - robust handling for spaces in query
  // Matches: "https://maxigen.media/video?q=search term"
  // Capture 2: Full matched URL
  // Capture 3: Type (image/video/gif)
  // Capture 4: Query string
  const regex = /(["'])(https:\/\/maxigen\.media\/(image|video|gif)\?q=([^"']*?))\1/g;
  
  let match;
  const replacements: { placeholder: string, type: string, query: string }[] = [];
  
  // Reset lastIndex to ensure global search works from start
  regex.lastIndex = 0;

  while ((match = regex.exec(code)) !== null) {
    replacements.push({
      placeholder: match[2],
      type: match[3],
      query: decodeURIComponent(match[4])
    });
  }

  if (replacements.length === 0) return code;

  let processedCode = code;
  const cache = new Map<string, string | null>();

  // Process all replacements in parallel where possible, but we map sequentially to manage cache
  for (const item of replacements) {
    if (cache.has(item.placeholder)) continue;

    let url: string | null = null;
    
    console.log(`Processing media: ${item.type} query="${item.query}"`);

    if (item.type === 'image') {
      const pexelsUrl = await fetchPexelsImage(item.query);
      if (pexelsUrl) {
          url = await uploadToHost(pexelsUrl);
      } else {
          url = `https://placehold.co/600x400?text=${encodeURIComponent(item.query)}`;
      }
    } else if (item.type === 'gif') {
      const giphyUrl = await fetchGiphyGif(item.query);
      if (giphyUrl) {
           url = giphyUrl;
      } else {
           url = `https://placehold.co/600x400?text=GIF:${encodeURIComponent(item.query)}`;
      }
    } else if (item.type === 'video') {
      url = await fetchYouTubeVideo(item.query);
      if (!url) {
          // Fallback if YouTube fails (e.g. quota limit)
          url = `https://www.youtube.com/embed/dQw4w9WgXcQ`; 
      }
    }

    if (url) {
        cache.set(item.placeholder, url);
    }
  }

  cache.forEach((url, placeholder) => {
    if (url) {
      // Global replace of the placeholder string in the code
      // We split and join to avoid regex injection issues with the URL string
      processedCode = processedCode.split(placeholder).join(url);
    }
  });

  return processedCode;
}
