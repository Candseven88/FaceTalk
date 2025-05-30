export interface PredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string | string[];
  error?: string;
  urls?: {
    get: string;
    cancel: string;
  };
  metrics?: {
    predict_time: number;
  };
}

// Live Portrait Animation
export interface LivePortraitInput {
  image: string;
  video: string;
}

// Voice Cloning
export interface VoiceCloneInput {
  text: string;
  prompt_text: string;
  chunk_length: number;
  voice_sample: string;
}

// Talking Portrait
export interface TalkingPortraitInput {
  seed: number;
  audio: string;
  image: string;
  dynamic_scale: number;
  min_resolution: number;
  inference_steps: number;
  keep_resolution: boolean;
}

// Environment check
export interface EnvCheckResult {
  tokenAvailable: boolean;
  tokenFormat?: {
    startsWithR8: boolean;
    length: number;
  } | null;
  environment: string;
  connectionTest: {
    status: string;
    error: string | null;
  };
} 