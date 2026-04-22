import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const PersonalityContext = createContext(null);

const DEMO_PERSONALITIES = [
  {
    id: 'demo1',
    name: 'Casual Me',
    emoji: '😎',
    tone: 'casual',
    traits: ['funny', 'chill', 'sarcastic', 'relatable'],
    commonWords: ['bro', 'ngl', 'lol', 'fr', 'lowkey', 'deadass', 'bruh', 'no cap'],
    avgSentenceLength: 'short',
    personality: 'Super chill and funny, uses gen-z slang naturally. Never takes things too seriously.',
    sampleResponse: "lmao it was pretty mid ngl, but like lowkey I kinda vibed with it fr"
  },
  {
    id: 'demo2',
    name: 'Work Mode',
    emoji: '💼',
    tone: 'professional',
    traits: ['formal', 'concise', 'analytical', 'direct'],
    commonWords: ['however', 'therefore', 'regarding', 'please', 'kindly', 'accordingly'],
    avgSentenceLength: 'medium',
    personality: 'Professional and structured communicator. Clear, direct, and efficient.',
    sampleResponse: "It was a productive day overall. I managed to complete the key deliverables ahead of schedule."
  },
  {
    id: 'demo3',
    name: 'Chaos Gremlin',
    emoji: '💀',
    tone: 'chaotic',
    traits: ['dramatic', 'hyperbolic', 'unhinged', 'expressive'],
    commonWords: ['literally', 'WHAT', 'omg', 'dead', 'crying', 'insane', 'actually', 'no WAY'],
    avgSentenceLength: 'mixed',
    personality: 'Maximum drama and expression. Everything is either amazing or a complete disaster.',
    sampleResponse: "literally WHAT. I am so dead right now, it was actually insane, I cannot even explain"
  }
];

export function PersonalityProvider({ children }) {
  const [personalities, setPersonalities] = useState([]);
  const [activePersonality, setActivePersonality] = useState(null);
  const [chatHistories, setChatHistories] = useState({});
  const [currentMode, setCurrentMode] = useState('chill');
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem('cloneai_session');
    if (stored) return stored;
    const id = uuidv4();
    localStorage.setItem('cloneai_session', id);
    return id;
  });

  // Load personalities on mount
  useEffect(() => {
    const local = localStorage.getItem('cloneai_personalities');
    if (local) {
      try { setPersonalities(JSON.parse(local)); } catch {}
    }
    // Load chat histories
    const hist = localStorage.getItem('cloneai_histories');
    if (hist) {
      try { setChatHistories(JSON.parse(hist)); } catch {}
    }
  }, []);

  const saveLocal = useCallback((list) => {
    localStorage.setItem('cloneai_personalities', JSON.stringify(list));
  }, []);

  const saveHistories = useCallback((hist) => {
    localStorage.setItem('cloneai_histories', JSON.stringify(hist));
  }, []);

  const addPersonality = useCallback((p) => {
    const withId = { ...p, id: uuidv4() };
    setPersonalities(prev => {
      const next = [withId, ...prev];
      saveLocal(next);
      return next;
    });
    return withId;
  }, [saveLocal]);

  const deletePersonality = useCallback((id) => {
    setPersonalities(prev => {
      const next = prev.filter(p => p.id !== id);
      saveLocal(next);
      return next;
    });
    if (activePersonality?.id === id) setActivePersonality(null);
  }, [activePersonality, saveLocal]);

  const loadDemos = useCallback(() => {
    setPersonalities(DEMO_PERSONALITIES);
    saveLocal(DEMO_PERSONALITIES);
    toast.success('Demo personalities loaded!');
  }, [saveLocal]);

  const addMessage = useCallback((personalityId, message) => {
    setChatHistories(prev => {
      const next = {
        ...prev,
        [personalityId]: [...(prev[personalityId] || []), message]
      };
      saveHistories(next);
      return next;
    });
  }, [saveHistories]);

  const clearChat = useCallback((personalityId) => {
    setChatHistories(prev => {
      const next = { ...prev, [personalityId]: [] };
      saveHistories(next);
      return next;
    });
  }, [saveHistories]);

  return (
    <PersonalityContext.Provider value={{
      personalities,
      activePersonality,
      setActivePersonality,
      chatHistories,
      currentMode,
      setCurrentMode,
      sessionId,
      addPersonality,
      deletePersonality,
      loadDemos,
      addMessage,
      clearChat
    }}>
      {children}
    </PersonalityContext.Provider>
  );
}

export const usePersonalities = () => {
  const ctx = useContext(PersonalityContext);
  if (!ctx) throw new Error('usePersonalities must be inside PersonalityProvider');
  return ctx;
};
