import { ref } from "vue";

export interface Options {
  lang?: string; //语言
  continuous?: boolean; //是否连续识别
  interimResults?: boolean; //是否返回中间结果
  maxAlternatives?: number; //返回结果的最大数量
}

let instance: SpeechRecognition | null = null;

const getInstance = (options: Options): SpeechRecognition => {
  const speechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition; // 兼容 safari

  if (!speechRecognition) {
    throw new Error("Speech Recognition API is not supported in this browser.");
  }

  if (!instance) {
    const {
      lang = "zh-CN",
      continuous = false,
      interimResults = false,
      maxAlternatives = 1,
    } = options;
    instance = new speechRecognition();
    instance.lang = lang;
    instance.continuous = continuous;
    instance.interimResults = interimResults;
    instance.maxAlternatives = maxAlternatives;
  }
  return instance;
};

export const useVoiceToText = (options: Options) => {
  const recognition = getInstance(options);
  const isRecording = ref(false);

  recognition.onend = () => {
    isRecording.value = false;
  };

  const start = (callback?: (result: string) => void) => {
    isRecording.value = true;
    recognition.start();

    // 输出的结果
    recognition.onresult = (event) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results?.[i]?.[0]?.transcript;
      }
      callback?.(fullText);
    };
  };

  const stop = () => {
    isRecording.value = false;
    recognition.stop();
  };

  return {
    isRecording,
    start,
    stop,
  };
};
