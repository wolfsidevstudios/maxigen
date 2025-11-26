
// Wrapper for the Web Speech API
// Note: While the user provided an ElevenLabs key, ElevenLabs is primarily for TTS. 
// For robust, low-latency Speech-to-Text in the browser without a backend proxy, 
// the native Web Speech API is the standard solution.

export const speechToText = {
  isSupported: () => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
  
  start: (onResult: (text: string) => void, onEnd: () => void) => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      onEnd();
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        onResult(finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      onEnd();
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();
    return recognition;
  }
};
