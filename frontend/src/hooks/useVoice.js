import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useVoice({ onTranscript, onFinal }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const isSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const start = useCallback(() => {
    if (!isSupported) {
      toast.error('Voice input not supported in this browser. Try Chrome.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const current = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(current);
      onTranscript?.(current);

      if (event.results[event.results.length - 1].isFinal) {
        onFinal?.(current);
        setIsListening(false);
        setTranscript('');
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setTranscript('');
      if (event.error !== 'aborted') {
        toast.error(`Voice error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [isSupported, onTranscript, onFinal]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setTranscript('');
  }, []);

  const toggle = useCallback(() => {
    if (isListening) stop();
    else start();
  }, [isListening, start, stop]);

  return { isListening, transcript, toggle, isSupported };
}
