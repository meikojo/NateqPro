
import React, { useReducer, useEffect, useRef, useState } from 'react';
import { AppState, Dialect, AudioSettings, Language } from './types';
import { VOICE_PROFILES, SOUNDSCAPES, DIALECTS_BY_LANG, SUPPORTED_LANGUAGES } from './constants';
import SmartEditor from './components/SmartEditor';
import Visualizer from './components/Visualizer';
import { generateSpeech } from './services/geminiService';
import { createAudioUrlFromPcm } from './utils/audioUtils';

// Icons
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>;
const StopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>;
const DownloadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>;
const LoadingIcon = () => <svg className="animate-spin h-5 w-5 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
const ArrowsPointingInIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15h-4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>;
const ArrowsPointingOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>;

const initialState: AppState = {
  text: "أهلاً بك في ناطق برو. هذا استوديو صوتي متطور يعتمد على الذكاء الاصطناعي.\n(Happy) يمكنني التحدث بمشاعر مختلفة!\n[Pause: Medium]\n(Whisper) كما يمكنني الهمس بسرية تامة...",
  language: 'ar',
  dialect: 'msa',
  selectedVoiceId: 'v1',
  audioSettings: {
    stability: 50,
    speed: 1.0,
    pitch: 0,
    optimizedPronunciation: true,
  },
  selectedSoundscapeId: 'none',
  isGenerating: false,
  isPlaying: false,
  generatedAudioUrl: null,
  error: null,
};

type Action =
  | { type: 'SET_TEXT'; payload: string }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_DIALECT'; payload: string }
  | { type: 'SET_VOICE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AudioSettings> }
  | { type: 'SET_SOUNDSCAPE'; payload: string }
  | { type: 'START_GENERATION' }
  | { type: 'GENERATION_SUCCESS'; payload: string }
  | { type: 'GENERATION_ERROR'; payload: string }
  | { type: 'SET_PLAYING'; payload: boolean };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_TEXT': return { ...state, text: action.payload, error: null };
    case 'SET_LANGUAGE': {
       // Reset dialect to default (first one) when language changes
       const newLang = action.payload;
       const defaultDialect = DIALECTS_BY_LANG[newLang][0].id;
       return { ...state, language: newLang, dialect: defaultDialect };
    }
    case 'SET_DIALECT': return { ...state, dialect: action.payload };
    case 'SET_VOICE': return { ...state, selectedVoiceId: action.payload };
    case 'UPDATE_SETTINGS': return { ...state, audioSettings: { ...state.audioSettings, ...action.payload } };
    case 'SET_SOUNDSCAPE': return { ...state, selectedSoundscapeId: action.payload };
    case 'START_GENERATION': return { ...state, isGenerating: true, error: null, generatedAudioUrl: null, isPlaying: false };
    case 'GENERATION_SUCCESS': return { ...state, isGenerating: false, generatedAudioUrl: action.payload };
    case 'GENERATION_ERROR': return { ...state, isGenerating: false, error: action.payload };
    case 'SET_PLAYING': return { ...state, isPlaying: action.payload };
    default: return state;
  }
};

const App: React.FC = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const bgmRef = useRef<HTMLAudioElement>(new Audio());
  
  // UI State for Editor Collapse
  const [isInputCollapsed, setIsInputCollapsed] = useState(false);

  // Get current direction based on language
  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.id === state.language) || SUPPORTED_LANGUAGES[0];
  const direction = currentLangConfig.dir;

  // Handle Playback Logic
  useEffect(() => {
    const audio = audioRef.current;
    const bgm = bgmRef.current;

    const handleEnded = () => {
      dispatch({ type: 'SET_PLAYING', payload: false });
      bgm.pause();
      bgm.currentTime = 0;
    };
    
    audio.addEventListener('ended', handleEnded);
    
    // Playback state synchronization
    if (state.isPlaying) {
      if (state.generatedAudioUrl) {
        // Set Source if not already set or changed
        if (audio.src !== state.generatedAudioUrl) {
           audio.src = state.generatedAudioUrl;
        }
        
        audio.play().catch(e => console.error("Audio play failed", e));

        // Handle BGM
        const soundscape = SOUNDSCAPES.find(s => s.id === state.selectedSoundscapeId);
        if (soundscape && soundscape.url) {
          bgm.src = soundscape.url;
          bgm.volume = soundscape.volume;
          bgm.loop = true;
          bgm.play().catch(e => console.error("BGM play failed", e));
        }
      }
    } else {
      audio.pause();
      audio.currentTime = 0;
      bgm.pause();
      bgm.currentTime = 0;
    }

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      bgm.pause();
    };
  }, [state.isPlaying, state.generatedAudioUrl, state.selectedSoundscapeId]);

  const handleGenerate = async () => {
    dispatch({ type: 'START_GENERATION' });
    try {
      const selectedVoice = VOICE_PROFILES.find(v => v.id === state.selectedVoiceId);
      if (!selectedVoice) throw new Error("Invalid voice selected");

      const base64Audio = await generateSpeech({
        text: state.text,
        language: state.language,
        dialect: state.dialect,
        voice: selectedVoice,
        settings: state.audioSettings,
      });

      const url = createAudioUrlFromPcm(base64Audio);
      dispatch({ type: 'GENERATION_SUCCESS', payload: url });
    } catch (err: any) {
      dispatch({ type: 'GENERATION_ERROR', payload: err.message });
    }
  };

  const handleDownload = () => {
    if (!state.generatedAudioUrl) return;
    const link = document.createElement('a');
    link.href = state.generatedAudioUrl;
    // Generate filename from first 3 words
    const safeName = state.text.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9\u0600-\u06FF_]/g, '') || 'nateq_audio';
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePlay = () => {
    if (!state.generatedAudioUrl) return;
    dispatch({ type: 'SET_PLAYING', payload: !state.isPlaying });
  };

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 flex flex-col font-sans selection:bg-brand-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-dark-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <span className="text-lg font-display font-bold text-white">ن</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight font-display">
              Nateq<span className="text-brand-500">Pro</span>
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span className="hidden md:inline">Voice AI Studio</span>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-xs bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full border border-brand-500/20">v2.5 Flash</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Language & Dialect - Merged for flow */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-display">Language & Style</h2>
             
             {/* Language Selector */}
             <div className="space-y-1">
                <label className="text-xs text-gray-500">Language</label>
                <select 
                  value={state.language}
                  onChange={(e) => dispatch({ type: 'SET_LANGUAGE', payload: e.target.value as Language })}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/50 outline-none appearance-none font-medium"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>{lang.label}</option>
                  ))}
                </select>
             </div>

             {/* Dialect/Accent Selector */}
             <div className="space-y-1">
                <label className="text-xs text-gray-500">Dialect / Accent</label>
                <select 
                  value={state.dialect}
                  onChange={(e) => dispatch({ type: 'SET_DIALECT', payload: e.target.value })}
                  className="w-full bg-dark-900 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/50 outline-none appearance-none"
                >
                  {DIALECTS_BY_LANG[state.language].map((d) => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
             </div>
          </div>

          {/* Voice Selector */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-display">Voice Actor</h2>
            <div className="grid grid-cols-1 gap-3">
              {VOICE_PROFILES.map(voice => (
                <button
                  key={voice.id}
                  onClick={() => dispatch({ type: 'SET_VOICE', payload: voice.id })}
                  className={`relative flex items-start gap-4 p-3 rounded-xl border text-right transition-all group ${
                    state.selectedVoiceId === voice.id 
                      ? 'bg-brand-500/10 border-brand-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
                      : 'bg-dark-900 border-white/5 hover:border-white/10 hover:bg-dark-800'
                  }`}
                  dir="ltr" 
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                    state.selectedVoiceId === voice.id ? 'bg-brand-500 text-white' : 'bg-dark-800 text-gray-500'
                  }`}>
                    {voice.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className={`font-bold font-display ${state.selectedVoiceId === voice.id ? 'text-brand-400' : 'text-gray-200'}`}>{voice.name}</span>
                      <span className="text-[10px] uppercase tracking-wider bg-white/5 px-1.5 py-0.5 rounded text-gray-500">{voice.gender}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{voice.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="glass-panel rounded-2xl p-5 space-y-6">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider font-display">Studio Controls</h2>
            
            {/* Speed */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Speaking Rate</span>
                <span className="text-brand-400 font-mono">{state.audioSettings.speed}x</span>
              </div>
              <input 
                type="range" min="0.5" max="2.0" step="0.1"
                value={state.audioSettings.speed}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { speed: parseFloat(e.target.value) } })}
                className="w-full accent-brand-500 h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Pitch */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Pitch Shift</span>
                <span className="text-brand-400 font-mono">{state.audioSettings.pitch > 0 ? '+' : ''}{state.audioSettings.pitch} st</span>
              </div>
              <input 
                type="range" min="-20" max="20" step="1"
                value={state.audioSettings.pitch}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { pitch: parseInt(e.target.value) } })}
                className="w-full accent-brand-500 h-1 bg-dark-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Soundscape */}
            <div className="space-y-3">
               <span className="text-xs text-gray-400 block">Ambience / Soundscape</span>
               <div className="grid grid-cols-2 gap-2">
                 {SOUNDSCAPES.map(s => (
                   <button
                    key={s.id}
                    onClick={() => dispatch({ type: 'SET_SOUNDSCAPE', payload: s.id })}
                    className={`text-xs px-3 py-2 rounded-lg border transition-all ${
                      state.selectedSoundscapeId === s.id
                        ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                        : 'bg-dark-900 border-white/5 text-gray-400 hover:bg-white/5'
                    }`}
                   >
                     {s.name}
                   </button>
                 ))}
               </div>
            </div>

            {/* Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full p-1 transition-colors ${state.audioSettings.optimizedPronunciation ? 'bg-brand-600' : 'bg-dark-800'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${state.audioSettings.optimizedPronunciation ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input 
                type="checkbox" className="hidden" 
                checked={state.audioSettings.optimizedPronunciation}
                onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', payload: { optimizedPronunciation: e.target.checked } })}
              />
              <span className="text-xs text-gray-300 group-hover:text-white transition-colors">
                  {state.language === 'ar' ? 'Optimized Pronunciation (Tashkeel)' : 'HD Pronunciation'}
              </span>
            </label>

          </div>
        </div>

        {/* Right Column: Editor & Visualizer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* 1. Editor Container */}
          <div className={`glass-panel rounded-2xl flex flex-col p-1 relative overflow-hidden shadow-xl transition-all duration-500 ease-in-out ${
             isInputCollapsed ? 'h-32' : 'h-[400px]'
          }`}>
             {/* Toggle Size Button */}
             <button 
                onClick={() => setIsInputCollapsed(!isInputCollapsed)}
                className={`absolute top-2 z-20 p-1.5 rounded-lg bg-dark-800/80 text-gray-400 hover:text-white hover:bg-brand-500 hover:shadow-lg transition-all border border-white/5 backdrop-blur-md ${direction === 'rtl' ? 'left-2' : 'right-2'}`}
                title={isInputCollapsed ? "Expand Editor" : "Collapse Editor"}
             >
               {isInputCollapsed ? <ArrowsPointingOutIcon /> : <ArrowsPointingInIcon />}
             </button>

             <SmartEditor 
               value={state.text} 
               onChange={(val) => dispatch({ type: 'SET_TEXT', payload: val })}
               disabled={state.isGenerating || state.isPlaying}
               direction={direction}
             />
             
             {state.error && (
               <div className="absolute bottom-4 right-4 left-4 bg-red-500/10 border border-red-500/20 text-red-200 text-sm p-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 z-30">
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 {state.error}
               </div>
             )}
          </div>

          {/* 2. Generate Button (Middle) */}
          <button
             onClick={handleGenerate}
             disabled={state.isGenerating || !state.text.trim()}
             className={`w-full h-16 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg text-lg tracking-wide ${
               state.isGenerating 
                 ? 'bg-dark-800 text-gray-500 cursor-wait'
                 : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white shadow-brand-500/20 hover:shadow-brand-500/40 active:scale-[0.99] transform'
             }`}
           >
             {state.isGenerating ? (
               <>
                 <LoadingIcon />
                 <span>Generating Audio...</span>
               </>
             ) : (
               <>
                 <SparklesIcon />
                 <span>Generate Speech</span>
               </>
             )}
          </button>

          {/* 3. Result / Player Panel (Bottom) */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden min-h-[200px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider font-display absolute top-4 right-4">Sound Result</h3>
             
             {/* Visualizer Area */}
             <div className="flex-1 w-full bg-dark-900/50 rounded-xl overflow-hidden relative border border-white/5 h-32 mt-4">
                <Visualizer isPlaying={state.isPlaying} />
                
                {!state.generatedAudioUrl && !state.isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 uppercase tracking-widest font-mono pointer-events-none">
                    No Audio Generated
                  </div>
                )}
             </div>

             {/* Player Controls */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                         onClick={togglePlay}
                         disabled={!state.generatedAudioUrl}
                         className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                             state.generatedAudioUrl 
                                ? 'bg-white text-dark-950 hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)]' 
                                : 'bg-dark-800 text-gray-600 cursor-not-allowed'
                         }`}
                    >
                         {state.isPlaying ? <StopIcon /> : <PlayIcon />}
                    </button>
                    
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-200">
                             {state.generatedAudioUrl ? "Audio Ready" : "Waiting..."}
                        </span>
                        <span className="text-xs text-gray-500">
                            {state.generatedAudioUrl ? "00:00 / --:--" : "Generate to play"}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                     <button 
                         onClick={handleDownload}
                         disabled={!state.generatedAudioUrl}
                         className={`px-4 py-2 rounded-lg border flex items-center gap-2 text-sm transition-all ${
                             state.generatedAudioUrl
                                ? 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                                : 'border-transparent text-gray-700 cursor-not-allowed'
                         }`}
                     >
                         <DownloadIcon />
                         <span>Download WAV</span>
                     </button>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
