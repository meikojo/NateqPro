
import React, { useState, useRef } from 'react';
import { EMOTION_TAGS } from '../constants';

interface SmartEditorProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  direction?: 'rtl' | 'ltr';
}

const SmartEditor: React.FC<SmartEditorProps> = ({ value, onChange, disabled, direction = 'rtl' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const [scrollPos, setScrollPos] = useState(0);

  // Sync scrolling between textarea and backdrop
  const handleScroll = () => {
    if (textareaRef.current) {
      setScrollPos(textareaRef.current.scrollTop);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const insertTag = (tagValue: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = value;
    
    // Add spaces around tag automatically
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const padLeft = (before.length > 0 && !before.endsWith(' ')) ? ' ' : '';
    const padRight = ' ';
    
    const insertion = `${padLeft}${tagValue}${padRight}`;
    const newText = `${before}${insertion}${after}`;
    
    onChange(newText);
    
    // Reset focus and cursor
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = start + insertion.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Render highlights
  const renderHighlights = () => {
    let html = value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    EMOTION_TAGS.forEach(tag => {
      const escaped = tag.value.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escaped, 'g');
      html = html.replace(regex, `<span class="${tag.color} rounded-sm outline outline-1 outline-white/10">${tag.value}</span>`);
    });

    html = html.replace(/(\[.*?\])/g, '<span class="bg-emerald-500/20 text-emerald-300 rounded-sm outline outline-1 outline-white/10">$1</span>');

    html = html.replace(/\n/g, '<br/>');

    if (value.endsWith('\n')) {
        html += '<br/>';
    }

    return html;
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-xl border border-white/10 overflow-hidden relative group focus-within:ring-2 focus-within:ring-brand-500/50 transition-all">
      {/* Toolbar */}
      <div className="bg-dark-800 border-b border-white/5 p-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0 z-20 relative">
        {EMOTION_TAGS.map((tag) => (
          <button
            key={tag.label}
            onClick={() => insertTag(tag.value)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all hover:bg-white/5 active:scale-95 flex items-center gap-1.5 border border-white/5 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full ${tag.color.split(' ')[0].replace('/20', '')}`}></span>
            {tag.label}
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 font-sans text-lg leading-loose overflow-hidden bg-dark-900">
        
        {/* Backdrop (Renderer) */}
        <div 
          ref={backdropRef}
          className={`absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words text-gray-100 z-0 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
          style={{ 
            scrollTop: scrollPos, 
            transform: `translateY(-${scrollPos}px)`,
            fontFamily: direction === 'rtl' ? 'Cairo, sans-serif' : 'sans-serif'
          }}
          dangerouslySetInnerHTML={{ __html: renderHighlights() }}
          dir={direction}
        />
        
        {/* Textarea (Input) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onScroll={handleScroll}
          disabled={disabled}
          placeholder={direction === 'rtl' ? "اكتب النص هنا... (Type your text here)" : "Type your text here..."}
          className={`absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-brand-500 placeholder-gray-600 resize-none outline-none border-none whitespace-pre-wrap break-words z-10 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}
          style={{ 
            fontFamily: direction === 'rtl' ? 'Cairo, sans-serif' : 'sans-serif',
          }}
          spellCheck={false}
          dir={direction}
        />
      </div>
      
      <div className={`absolute bottom-2 text-xs text-gray-500 bg-dark-950/80 px-2 py-1 rounded z-20 pointer-events-none ${direction === 'rtl' ? 'left-2' : 'right-2'}`}>
        {value.length} chars
      </div>
    </div>
  );
};

export default SmartEditor;
