// hooks/useSpeechRecognition.ts
import { useEffect, useRef, useState } from 'react';

// Extend the Window interface to include SpeechRecognition APIs
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Add SpeechRecognition type for TypeScript
type SpeechRecognition = InstanceType<
  typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition
>;

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Speech Recognition API not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: { error: any; }) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    recognitionRef.current.start();
    setIsListening(true);
  };

  return {
    isListening,
    transcript,
    startListening,
    setTranscript,
  };
};
