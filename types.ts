
export type Language = 'ar' | 'en' | 'fr' | 'es';
export type Dialect = string; // Generalizing to support IDs like 'msa', 'us', 'fr-std'

export type VoiceGender = 'male' | 'female';
export type VoiceAge = 'young' | 'middle' | 'old' | 'child';

// Maps to Gemini prebuilt voices
export enum GeminiVoiceName {
  Puck = 'Puck',
  Charon = 'Charon',
  Kore = 'Kore',
  Fenrir = 'Fenrir',
  Zephyr = 'Zephyr'
}

export interface VoiceProfile {
  id: string;
  name: string;
  geminiVoice: GeminiVoiceName;
  gender: VoiceGender;
  description: string;
  basePitch?: 'low' | 'medium' | 'high';
}

export interface AudioSettings {
  stability: number; // 0-100 (Variance)
  speed: number; // 0.5 - 2.0
  pitch: number; // -20 to +20 semitones
  optimizedPronunciation: boolean;
}

export interface Soundscape {
  id: string;
  name: string;
  url: string | null; // URL to mp3, null for None
  volume: number; // 0-1
}

export interface AppState {
  text: string;
  language: Language;
  dialect: Dialect;
  selectedVoiceId: string;
  audioSettings: AudioSettings;
  selectedSoundscapeId: string;
  isGenerating: boolean;
  isPlaying: boolean;
  generatedAudioUrl: string | null;
  error: string | null;
}

export interface GenerationRequest {
  text: string;
  language: Language;
  dialect: Dialect;
  voice: VoiceProfile;
  settings: AudioSettings;
}
