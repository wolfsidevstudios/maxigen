
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
        console.warn("FreeImage upload failed, using original URL");
        return imageUrl;
    }
    
    const data = await res.json();
    return data.image?.url || imageUrl;
  } catch (e) {
    console.warn("FreeImage upload error:", e);
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
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${YOUTUBE_KEY}&type=video&maxResults=1`);
    if (!res.ok) throw new Error("YouTube API error");
    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch (e) {
    console.warn("YouTube fetch failed:", e);
    return null;
  }
}

// --- MAIN PROCESSOR ---

export async function processCodeWithMedia(code: string): Promise<string> {
  // Regex to find placeholders
  const regex = /["'](https:\/\/maxigen\.media\/(image|video|gif)\?q=([^"'\s]+))["']/g;
  
  let match;
  const replacements: { placeholder: string, type: string, query: string }[] = [];
  
  while ((match = regex.exec(code)) !== null) {
    replacements.push({
      placeholder: match[1],
      type: match[2],
      query: decodeURIComponent(match[3])
    });
  }

  if (replacements.length === 0) return code;

  let processedCode = code;
  const cache = new Map<string, string | null>();

  for (const item of replacements) {
    if (cache.has(item.placeholder)) continue;

    let url: string | null = null;
    
    if (item.type === 'image') {
      const pexelsUrl = await fetchPexelsImage(item.query);
      if (pexelsUrl) {
          // Upload to host for permanence
          url = await uploadToHost(pexelsUrl);
      } else {
          url = `https://placehold.co/600x400?text=${encodeURIComponent(item.query)}`;
      }
    } else if (item.type === 'gif') {
      const giphyUrl = await fetchGiphyGif(item.query);
      if (giphyUrl) {
           // Optional: Upload GIFs too if desired, but Giphy links are usually stable.
           // url = await uploadToHost(giphyUrl); 
           url = giphyUrl;
      } else {
           url = `https://placehold.co/600x400?text=GIF:${encodeURIComponent(item.query)}`;
      }
    } else if (item.type === 'video') {
      url = await fetchYouTubeVideo(item.query);
      if (!url) url = `https://www.youtube.com/embed/dQw4w9WgXcQ`; 
    }

    cache.set(item.placeholder, url);
  }

  cache.forEach((url, placeholder) => {
    if (url) {
      const safePlaceholder = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      processedCode = processedCode.replace(new RegExp(safePlaceholder, 'g'), url);
    }
  });

  return processedCode;
}
