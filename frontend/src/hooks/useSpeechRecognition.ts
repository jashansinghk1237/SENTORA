import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognitionHook {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  errorMessage: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  setTranscript: (text: string) => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState<string>("");
  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isSupported = typeof window !== "undefined" && Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );

  useEffect(() => {
    if (!isSupported) {
      setErrorMessage("Voice transcription is not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalStr = "";
      let interimStr = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          finalStr += (finalStr ? " " : "") + text.trim();
        } else {
          interimStr += text;
        }
      }

      if (finalStr) {
        setTranscript((prev) => {
          const separator = prev && !prev.endsWith(" ") ? " " : "";
          return prev + separator + finalStr;
        });
      }

      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        setErrorMessage("Microphone access for speech recognition was denied.");
      } else if (event.error === "no-speech") {
        // Normal when user is silent, ignore
      } else if (event.error === "network") {
        setErrorMessage("Network connection needed for online speech recognition.");
      } else {
        setErrorMessage(`Speech recognition issue: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch (e) {}
    };
  }, [isSupported]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setErrorMessage("Voice transcription is not supported in this browser.");
      return;
    }

    setErrorMessage(null);
    setInterimTranscript("");

    try {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
      }
    } catch (err: any) {
      console.warn("Could not start speech recognition:", err);
      // Might already be active
      setIsListening(true);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
      setIsListening(false);
      setInterimTranscript("");
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    setErrorMessage(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    errorMessage,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
  };
}
