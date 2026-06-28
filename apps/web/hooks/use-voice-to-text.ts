"use client";

import { useRef, useState } from "react";

export interface VoiceOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

type SpeechRecognitionConstructor = new () => SpeechRecognition;

export const useVoiceToText = (options: VoiceOptions = {}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const getRecognition = () => {
    if (typeof window === "undefined") return null;
    const constructor = (window.SpeechRecognition ||
      window.webkitSpeechRecognition) as SpeechRecognitionConstructor | undefined;
    if (!constructor) {
      throw new Error("Speech Recognition API is not supported in this browser.");
    }
    if (!recognitionRef.current) {
      const recognition = new constructor();
      recognition.lang = options.lang ?? "zh-CN";
      recognition.continuous = options.continuous ?? false;
      recognition.interimResults = options.interimResults ?? false;
      recognition.maxAlternatives = options.maxAlternatives ?? 1;
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
    return recognitionRef.current;
  };

  const start = (callback?: (result: string) => void) => {
    const recognition = getRecognition();
    if (!recognition) return;
    setIsRecording(true);
    recognition.onresult = (event) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i += 1) {
        fullText += event.results[i]?.[0]?.transcript ?? "";
      }
      callback?.(fullText);
    };
    recognition.start();
  };

  const stop = () => {
    const recognition = getRecognition();
    setIsRecording(false);
    recognition?.stop();
  };

  return {
    isRecording,
    start,
    stop,
  };
};
