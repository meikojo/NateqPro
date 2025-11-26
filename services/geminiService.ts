
import { GoogleGenAI, Modality } from "@google/genai";
import { GenerationRequest } from '../types';

/**
 * Constructs the sophisticated prompt including "Director Mode" instructions.
 * Adapted for Multi-language support.
 */
const buildPrompt = (req: GenerationRequest): string => {
  const { language, dialect, voice, settings } = req;
  
  const speedInstruction = settings.speed > 1.1 ? "Speak fast and energetically." : settings.speed < 0.9 ? "Speak slowly." : "";
  const pitchInstruction = settings.pitch > 5 ? "Use a high pitch." : settings.pitch < -5 ? "Use a deep voice." : "";
  
  // Pronunciation mode is language-dependent
  let pronunciationInstruction = "Speak naturally.";
  if (settings.optimizedPronunciation) {
     if (language === 'ar') {
         pronunciationInstruction = "Enunciate clearly like an audiobook narrator. Follow Tashkeel strictly.";
     } else {
         pronunciationInstruction = "Enunciate every word clearly like a professional broadcaster.";
     }
  }

  // Dialect/Accent Rules Map
  const dialectRules: Record<string, string> = {
    // Arabic
    'msa': "Use Modern Standard Arabic (Fusha).",
    'egyptian': "Use Egyptian Dialect (Masri).",
    'khaleeji': "Use Gulf (Khaleeji) Dialect.",
    'levantine': "Use Levantine (Shami) Dialect.",
    'moroccan': "Use Moroccan Darija.",
    // English
    'us': "Use a General American accent.",
    'uk': "Use a British RP accent.",
    'in': "Use an Indian English accent.",
    'au': "Use an Australian English accent.",
    // French
    'fr': "Use Standard Parisian French.",
    'ca': "Use Canadian Québécois French.",
    // Spanish
    'es': "Use Peninsular (European) Spanish.",
    'mx': "Use Mexican Spanish.",
  };

  const specificDialectRule = dialectRules[dialect] || `Use standard ${language} pronunciation.`;

  return `
[Instructions: You are a professional Voice Actor named ${voice.name} (${voice.description}).
Language: ${language.toUpperCase()}
Accent/Dialect: ${specificDialectRule}
Tone: ${pitchInstruction} ${speedInstruction}
Style: ${pronunciationInstruction}
Acting: Do not read tags like (Happy) aloud, act them out. 
${language === 'ar' ? 'Phonetics: If text has Tashkeel, follow strictly. If raw, infer I\'rab contextually.' : ''}]

${req.text}
  `;
};

export const generateSpeech = async (req: GenerationRequest): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Merge instructions into the text prompt to be safe with TTS model capabilities
  const promptText = buildPrompt(req);

  try {
    // We MUST use the TTS model for audio generation.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts", 
      contents: [
        {
          parts: [{ text: promptText }]
        }
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: req.voice.geminiVoice
            }
          }
        },
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    
    if (part?.text && !part.inlineData) {
         throw new Error(`Model returned text instead of audio. The request might be too complex for TTS mode.`);
    }

    const base64Audio = part?.inlineData?.data;

    if (!base64Audio) {
      throw new Error("No audio data received from Gemini.");
    }

    return base64Audio;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let msg = error.message || "Failed to generate speech";
    // Friendly error for common API issues
    if (msg.includes('400')) msg = "Invalid Request (400). The model may not support complex instructions.";
    if (msg.includes('500')) msg = "Server Error (500). Please try again in a moment.";
    if (msg.includes('text output')) msg = "Model configuration error: Selected model does not support audio.";
    throw new Error(msg);
  }
};
