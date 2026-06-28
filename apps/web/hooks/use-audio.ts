"use client";

export interface AudioOptions {
  rate?: number;
  volume?: number;
  pitch?: number;
  lang?: string;
}

let instance: SpeechSynthesisUtterance | null = null;

const getInstance = (options: AudioOptions) => {
  if (!instance) {
    instance = new SpeechSynthesisUtterance();
    const { rate = 0.7, volume = 1, pitch = 1, lang = "en-US" } = options;
    instance.rate = rate;
    instance.volume = volume;
    instance.pitch = pitch;
    instance.lang = lang;
  }
  return instance;
};

export const useAudio = (options: AudioOptions = {}) => {
  const playAudio = (word: string) => {
    if (typeof window === "undefined") return;
    const pronounce = getInstance(options);
    pronounce.text = word;
    speechSynthesis.speak(pronounce);
  };

  return { playAudio };
};
