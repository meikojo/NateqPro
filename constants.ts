
import { VoiceProfile, GeminiVoiceName, Soundscape, Language } from './types';

export const VOICE_PROFILES: VoiceProfile[] = [
  { id: 'v1', name: 'Rawi (Deep)', geminiVoice: GeminiVoiceName.Fenrir, gender: 'male', description: 'Grave Narrator, Authoritative', basePitch: 'low' },
  { id: 'v2', name: 'Zaynab (Clear)', geminiVoice: GeminiVoiceName.Kore, gender: 'female', description: 'Soothing, Audiobook Standard', basePitch: 'medium' },
  { id: 'v3', name: 'Omar (Energetic)', geminiVoice: GeminiVoiceName.Puck, gender: 'male', description: 'Young, Fast-paced, YouTube style', basePitch: 'medium' },
  { id: 'v4', name: 'Layla (Soft)', geminiVoice: GeminiVoiceName.Zephyr, gender: 'female', description: 'Whispery, Emotional', basePitch: 'high' },
];

export const SOUNDSCAPES: Soundscape[] = [
  { id: 'none', name: 'No Background', url: null, volume: 0 },
  { id: 'rain', name: 'Heavy Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg', volume: 0.3 },
  { id: 'cafe', name: 'Busy Cafe', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg', volume: 0.3 },
  { id: 'drama', name: 'Dramatic Drone', url: 'https://actions.google.com/sounds/v1/science_fiction/human_entering_atmosphere.ogg', volume: 0.4 }, 
];

export const SUPPORTED_LANGUAGES: { id: Language; label: string; dir: 'rtl' | 'ltr' }[] = [
  { id: 'ar', label: 'Arabic (العربية)', dir: 'rtl' },
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'fr', label: 'French (Français)', dir: 'ltr' },
  { id: 'es', label: 'Spanish (Español)', dir: 'ltr' },
];

// Map language ID to its available accents/dialects
export const DIALECTS_BY_LANG: Record<Language, { id: string; label: string }[]> = {
  ar: [
    { id: 'msa', label: 'Modern Standard Arabic (Fusha)' },
    { id: 'egyptian', label: 'Egyptian Dialect (Masri)' },
    { id: 'khaleeji', label: 'Gulf Dialect (Khaleeji)' },
    { id: 'levantine', label: 'Levantine (Shami)' },
    { id: 'moroccan', label: 'Moroccan (Darija)' },
  ],
  en: [
    { id: 'us', label: 'American English (US)' },
    { id: 'uk', label: 'British English (UK)' },
    { id: 'in', label: 'Indian English' },
    { id: 'au', label: 'Australian English' },
  ],
  fr: [
    { id: 'fr', label: 'Standard French (Parisian)' },
    { id: 'ca', label: 'Canadian French (Québécois)' },
  ],
  es: [
    { id: 'es', label: 'Peninsular Spanish (Spain)' },
    { id: 'mx', label: 'Mexican Spanish (LatAm)' },
  ]
};

export const EMOTION_TAGS = [
  { label: 'Happy', value: '(Happy)', color: 'bg-yellow-500/20 text-yellow-300' },
  { label: 'Sad', value: '(Sad)', color: 'bg-blue-500/20 text-blue-300' },
  { label: 'Whisper', value: '(Whisper)', color: 'bg-purple-500/20 text-purple-300' },
  { label: 'Fear', value: '(Fear)', color: 'bg-red-500/20 text-red-300' },
  { label: 'Pause', value: '[Pause: Medium]', color: 'bg-gray-500/20 text-gray-300' },
];
