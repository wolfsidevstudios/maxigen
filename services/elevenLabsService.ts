
export const speakText = async (text: string) => {
  const apiKey = localStorage.getItem('elevenlabs_key');
  
  // Browser Fallback if no key
  if (!apiKey) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    return;
  }

  try {
    // Default Voice ID (Rachel)
    const voiceId = "21m00Tcm4TlvDq8ikWAM"; 
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) throw new Error("ElevenLabs Error");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (error) {
    console.error("TTS Error:", error);
    // Fallback on error
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};
