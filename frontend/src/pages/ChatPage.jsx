import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { usePersonalities } from '../context/PersonalityContext';
import { useVoice } from '../hooks/useVoice';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const MODES = [
  { id: 'chill', label: '😎 Chill' },
  { id: 'pro', label: '💼 Pro' },
  { id: 'angry', label: '😡 Angry' },
];

const DEMO_PROMPTS = [
  'Introduce yourself in your own style',
  'What do you think about AI taking over?',
  'Tell me something interesting about yourself',
  'How would you react if you won the lottery?',
];

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    personalities, activePersonality, setActivePersonality,
    chatHistories, currentMode, setCurrentMode,
    addMessage, clearChat
  } = usePersonalities();

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  // Load personality from URL param
  useEffect(() => {
    if (id) {
      const p = personalities.find(p => p.id === id);
      if (p) setActivePersonality(p);
    }
  }, [id, personalities]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistories, activePersonality?.id, isTyping]);

  const messages = activePersonality ? (chatHistories[activePersonality.id] || []) : [];

  // Voice input
  const { isListening, transcript, toggle: toggleVoice, isSupported: voiceSupported } = useVoice({
    onTranscript: (t) => setInput(t),
    onFinal: (t) => { setInput(t); inputRef.current?.focus(); }
  });

  async function send() {
    const text = input.trim();
    if (!text || !activePersonality || isTyping) return;
    setInput('');
    resetTextarea();

    const time = now();
    const userMsg = { role: 'user', content: text, time };
    addMessage(activePersonality.id, userMsg);
    setIsTyping(true);

    try {
      const data = await api.chat({
        personality: activePersonality,
        message: text,
        mode: currentMode,
        history: messages.slice(-10)
      });
      const aiMsg = { role: 'ai', content: data.reply, time: now() };
      addMessage(activePersonality.id, aiMsg);
    } catch (err) {
      // Fallback: local Claude API call
      try {
        const reply = await callClaudeDirect(text);
        addMessage(activePersonality.id, { role: 'ai', content: reply, time: now() });
      } catch (e2) {
        addMessage(activePersonality.id, {
          role: 'ai',
          content: '*(Backend offline — set VITE_API_URL or run the Express server)*',
          time: now()
        });
      }
    }
    setIsTyping(false);
  }

  async function callClaudeDirect(userMessage) {
    const p = activePersonality;
    const modeMap = {
      chill: 'Be super casual and relaxed, use slang freely.',
      pro: 'Be polished but keep personality traits.',
      angry: 'Be blunt and a bit edgy.'
    };
    const system = `You are a personality clone of ${p.name}. Tone: ${p.tone}. Traits: ${p.traits.join(', ')}. Use these words naturally: ${p.commonWords.join(', ')}. Sentence length: ${p.avgSentenceLength}. Mode: ${modeMap[currentMode]}. NEVER break character or say you're an AI. Max 3-4 sentences.`;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        system,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    if (!res.ok) throw new Error('Direct API failed');
    const d = await res.json();
    return d.content[0].text;
  }

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  function resetTextarea() {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  function autoResize(e) {
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  }

  function handleClear() {
    if (!activePersonality) return;
    clearChat(activePersonality.id);
    toast.success('Chat cleared');
  }

  function handleExport() {
    if (!activePersonality) return;
    const data = JSON.stringify({ personality: activePersonality, messages }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePersonality.name}_chat.json`;
    a.click();
    toast.success('Exported!');
  }

  function copyText(text) {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  }

  return (
    <div className="flex h-[calc(100vh-57px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 flex-shrink-0 border-r border-white/[0.07] flex flex-col"
        style={{ background: '#111118' }}>
        <div className="p-3 border-b border-white/[0.07]">
          <h3 className="font-display font-bold text-sm px-1">Personalities</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {!personalities.length ? (
            <div className="text-center p-4 text-xs text-white/25">
              No personalities yet.{' '}
              <button onClick={() => navigate('/train')} className="text-purple-400 hover:underline">Create one →</button>
            </div>
          ) : (
            personalities.map(p => (
              <button key={p.id}
                onClick={() => setActivePersonality(p)}
                className={`w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-xl mb-1 transition-all ${
                  activePersonality?.id === p.id
                    ? 'bg-purple-500/10 border border-purple-500/20'
                    : 'hover:bg-white/[0.04]'
                }`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: 'rgba(124,107,252,0.1)' }}>
                  {p.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-white/25 truncate">{p.tone}</div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Mode selector */}
        <div className="p-3 border-t border-white/[0.07]">
          <p className="text-xs uppercase tracking-widest text-white/25 mb-2">Mode</p>
          <div className="flex gap-1">
            {MODES.map(m => (
              <button key={m.id}
                onClick={() => { setCurrentMode(m.id); toast(m.label + ' mode', { duration: 1500 }); }}
                className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${
                  currentMode === m.id
                    ? 'bg-bg-4 border border-white/10 text-white'
                    : 'text-white/30 hover:text-white/60'
                }`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]"
          style={{ background: 'var(--bg)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'rgba(124,107,252,0.12)' }}>
              {activePersonality?.emoji || '🧠'}
            </div>
            <div>
              <div className="font-display font-bold text-sm">
                {activePersonality?.name || 'Select a personality'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-teal-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 inline-block" />
                {activePersonality ? `${currentMode} mode` : 'Offline'}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              ↓ Export
            </button>
            <button onClick={handleClear}
              className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white/40 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-colors">
              Clear
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
          {!activePersonality ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4 opacity-20">💬</div>
              <p className="text-white/30 text-sm">Select a personality from the sidebar</p>
              <p className="text-white/20 text-xs mt-1">or <button onClick={() => navigate('/train')} className="text-purple-400 hover:underline">create a new one</button></p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-5xl">
                {activePersonality.emoji}
              </motion.div>
              <div>
                <p className="font-medium mb-1">Hey! I'm your <span className="text-purple-300">{activePersonality.name}</span> clone.</p>
                <p className="text-white/30 text-sm">Say something or try a prompt below.</p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-xs">
                {DEMO_PROMPTS.map(p => (
                  <button key={p}
                    onClick={() => { setInput(p); send(); }}
                    className="text-left px-4 py-2.5 rounded-xl border border-white/[0.07] text-sm text-white/40 hover:text-white/70 hover:border-white/10 hover:bg-white/[0.03] transition-all">
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="text-center text-xs text-white/15 mb-2">Start of conversation</div>
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} personality={activePersonality} onCopy={copyText} />
                ))}
              </AnimatePresence>
              {isTyping && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2 max-w-[75%]">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                    style={{ background: 'rgba(124,107,252,0.12)' }}>
                    {activePersonality.emoji}
                  </div>
                  <div className="flex gap-1.5 px-4 py-3 rounded-2xl rounded-bl border border-white/[0.08]"
                    style={{ background: '#111118' }}>
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-white/30" />
                  </div>
                </motion.div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="px-4 py-3 border-t border-white/[0.07]">
          {isListening && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-purple-400 mb-2 flex items-center gap-1.5 px-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              {transcript || 'Listening...'}
            </motion.div>
          )}
          <div className={`flex items-end gap-2 px-3 py-2 rounded-2xl border transition-all ${
            isListening ? 'border-red-500/30 bg-red-500/[0.03]' : 'border-white/[0.08] focus-within:border-purple-500/40'
          }`} style={{ background: isListening ? undefined : '#111118' }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
              placeholder={activePersonality ? `Message ${activePersonality.name}...` : 'Select a personality first...'}
              disabled={!activePersonality}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-sm resize-none text-white placeholder:text-white/20 max-h-28 disabled:cursor-not-allowed"
              style={{ scrollbarWidth: 'none' }}
            />
            <div className="flex items-center gap-1.5 flex-shrink-0 pb-0.5">
              {voiceSupported && (
                <button onClick={toggleVoice}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all ${
                    isListening ? 'bg-red-500/15 text-red-400' : 'text-white/30 hover:text-white/60 hover:bg-white/[0.06]'
                  }`}>
                  🎤
                </button>
              )}
              <button onClick={send} disabled={!input.trim() || !activePersonality || isTyping}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:opacity-85"
                style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}>
                ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message, personality, onCopy }) {
  const isUser = message.role === 'user';
  const [showCopy, setShowCopy] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 max-w-[75%] group ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mb-0.5 ${
        isUser ? '' : ''
      }`} style={{ background: isUser ? 'rgba(45,212,191,0.12)' : 'rgba(124,107,252,0.12)' }}>
        {isUser ? '👤' : personality.emoji}
      </div>
      <div className={isUser ? 'items-end flex flex-col' : 'items-start flex flex-col'}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed relative ${
          isUser
            ? 'text-white rounded-br bubble-user'
            : 'text-white/80 border border-white/[0.08] rounded-bl bubble-ai'
        }`} style={isUser
          ? { background: 'linear-gradient(135deg, #7c6bfc, #6044e8)' }
          : { background: '#111118' }}>
          {message.content}
          <AnimatePresence>
            {showCopy && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => onCopy(message.content)}
                className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md border border-white/10 text-xs text-white/30 hover:text-white/60"
                style={{ background: '#1c1c28', fontSize: '10px' }}>
                copy
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <span className="text-xs text-white/15 mt-1 px-1">{message.time}</span>
      </div>
    </motion.div>
  );
}
