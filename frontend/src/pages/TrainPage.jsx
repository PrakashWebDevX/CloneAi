import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePersonalities } from '../context/PersonalityContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const EMOJIS = ['😎','🤓','🔥','💀','🌙','⚡','🎭','👾','🦊','🐉','🎯','💫','🧠','🤡','👑'];
const SAMPLE_TEXT = `yo bro what's up lol
ngl that was kinda cringe fr fr
wait WHAT no way that actually happened
bro I'm literally dead 💀
okay okay okay listen up
lowkey I kinda vibe with it tho
no cap that was the funniest thing I've seen all week
bruh why does this always happen to me lmaooo
it is what it is i guess
deadass though we need to talk about this`;

const TAG_COLORS = [
  'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'bg-pink-500/10 text-pink-300 border-pink-500/20',
  'bg-teal-500/10 text-teal-300 border-teal-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
  'bg-green-500/10 text-green-300 border-green-500/20',
];

export default function TrainPage() {
  const navigate = useNavigate();
  const { addPersonality } = usePersonalities();

  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('😎');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  async function analyze() {
    if (!name.trim()) { toast.error('Enter a name first'); return; }
    if (text.trim().length < 50) { toast.error('Need at least 50 characters of text'); return; }

    setLoading(true);
    try {
      const data = await api.analyze(text);
      setProfile(data.profile);
      toast.success('Personality extracted!');
    } catch (err) {
      // Fallback: client-side extraction if backend unavailable
      const fallback = extractLocally(text);
      setProfile(fallback);
      toast('Using local analysis (backend offline)', { icon: '⚠️' });
    }
    setLoading(false);
  }

  function extractLocally(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const freq = {};
    words.forEach(w => { if (w.length > 2) freq[w] = (freq[w] || 0) + 1; });
    const common = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,12).map(([w]) => w);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 3);
    const avgLen = sentences.reduce((a,s) => a + s.trim().split(/\s+/).length, 0) / (sentences.length || 1);
    const slang = ['ngl','lol','fr','bruh','bro','omg','nah','yoo','lowkey','deadass','no cap','lmao'];
    const foundSlang = slang.filter(s => text.toLowerCase().includes(s));
    const hasCaps = (text.match(/[A-Z]{2,}/g) || []).length > 2;
    const hasEmoji = /[\u{1F300}-\u{1FFFF}]/u.test(text);
    const exclamations = (text.match(/!/g) || []).length;

    let tone = 'casual';
    if (foundSlang.length > 3) tone = 'casual';
    else if (exclamations > 5 || hasCaps) tone = 'chaotic';
    else if (avgLen > 20) tone = 'professional';

    const traits = [];
    if (foundSlang.length > 2) traits.push('slangy');
    if (hasCaps) traits.push('expressive');
    if (hasEmoji) traits.push('emoji-user');
    if (avgLen < 8) traits.push('concise');
    if (exclamations > 3) traits.push('energetic');
    if (traits.length < 3) traits.push('authentic', 'natural');

    return {
      tone,
      traits: traits.slice(0, 5),
      commonWords: [...foundSlang.slice(0,6), ...common.slice(0,6)].slice(0,12),
      avgSentenceLength: avgLen < 8 ? 'short' : avgLen < 16 ? 'medium' : 'long',
      punctuationStyle: hasEmoji ? 'emoji-heavy' : exclamations > 4 ? 'heavy' : 'normal',
      capitalizationStyle: hasCaps ? 'SHOUTING' : 'mixed',
      personality: `Casual communicator with a ${tone} tone. Uses natural language with ${foundSlang.length > 2 ? 'lots of slang' : 'straightforward phrasing'}.`,
      sampleResponse: foundSlang.length > 2
        ? `${foundSlang[0]} yeah ${foundSlang[1] || 'ngl'} that's actually pretty ${tone === 'chaotic' ? 'WILD' : 'interesting'}`
        : 'Yeah that makes sense, I can see where you\'re coming from.'
    };
  }

  function save() {
    if (!profile || !name.trim()) { toast.error('Complete analysis first'); return; }
    const p = addPersonality({ name: name.trim(), emoji, ...profile });
    toast.success(`"${name}" saved!`);
    navigate('/chat');
  }

  function useSample() {
    setText(SAMPLE_TEXT);
    setName('Casual Me');
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display font-bold text-2xl mb-1">Train a Personality</h1>
        <p className="text-white/40 text-sm mb-8">Paste your old chats or writing. Claude will extract your unique style.</p>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Personality Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Casual Me, Work Mode, Night Owl..."
            className="w-full px-4 py-3 rounded-xl bg-bg-2 border border-white/[0.08] focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 text-sm transition-all placeholder:text-white/20" />
        </div>

        {/* Emoji picker */}
        <div className="mb-5">
          <label className="block text-xs uppercase tracking-widest text-white/30 mb-2">Avatar</label>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className={`w-10 h-10 rounded-lg text-xl transition-all ${
                  emoji === e
                    ? 'bg-purple-500/20 border-2 border-purple-500/50 scale-110'
                    : 'bg-bg-2 border border-white/[0.08] hover:bg-bg-3'
                }`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Text input */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-widest text-white/30">
              Sample Chats / Writing
              <span className="normal-case tracking-normal text-white/20 ml-2">(min 50 chars)</span>
            </label>
            <button onClick={useSample} className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Use sample ↗
            </button>
          </div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={`Paste your WhatsApp chats, tweets, Discord messages...\n\nThe more text you provide, the better the personality clone!`}
            rows={10}
            className="w-full px-4 py-3 rounded-xl bg-bg-2 border border-white/[0.08] focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/10 text-sm transition-all placeholder:text-white/20 resize-none font-mono leading-relaxed"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-white/20">More text = better clone accuracy</span>
            <span className={`text-xs ${text.length < 50 ? 'text-white/20' : 'text-green-400'}`}>
              {text.length} chars
            </span>
          </div>
        </div>

        {/* Analyze button */}
        <motion.button
          onClick={analyze}
          disabled={loading}
          whileHover={!loading ? { scale: 1.01 } : {}}
          whileTap={!loading ? { scale: 0.99 } : {}}
          className="w-full py-4 rounded-xl font-display font-bold text-white text-lg mb-6 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analyzing personality...
            </span>
          ) : '✦ Analyze Personality'}
        </motion.button>

        {/* Results */}
        <AnimatePresence>
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.08] p-5 mb-6"
              style={{ background: '#111118' }}
            >
              <h3 className="font-display font-bold mb-4">✨ Personality Profile Extracted</h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Tone', value: profile.tone },
                  { label: 'Sentence Length', value: profile.avgSentenceLength },
                  { label: 'Punctuation', value: profile.punctuationStyle || 'natural' },
                  { label: 'Capitalization', value: profile.capitalizationStyle || 'mixed' },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-xl p-3" style={{ background: '#16161f' }}>
                    <div className="text-xs uppercase tracking-widest text-white/25 mb-1">{label}</div>
                    <div className="text-sm font-medium capitalize">{value}</div>
                  </div>
                ))}
              </div>

              {/* Personality desc */}
              <div className="rounded-xl p-3 mb-4" style={{ background: '#16161f' }}>
                <div className="text-xs uppercase tracking-widest text-white/25 mb-1">Personality Vibe</div>
                <p className="text-sm text-white/60 leading-relaxed">{profile.personality}</p>
              </div>

              {/* Sample response */}
              {profile.sampleResponse && (
                <div className="rounded-xl p-3 mb-4 border border-purple-500/10" style={{ background: 'rgba(124,107,252,0.05)' }}>
                  <div className="text-xs uppercase tracking-widest text-purple-400/50 mb-1">How they'd say "how was your day?"</div>
                  <p className="text-sm text-purple-200/70 italic">"{profile.sampleResponse}"</p>
                </div>
              )}

              {/* Traits */}
              <div className="mb-4">
                <div className="text-xs uppercase tracking-widest text-white/25 mb-2">Traits</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.traits.map((t, i) => (
                    <span key={t} className={`text-xs px-2.5 py-1 rounded-full border ${TAG_COLORS[i % TAG_COLORS.length]}`}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Common words */}
              <div>
                <div className="text-xs uppercase tracking-widest text-white/25 mb-2">Common Words / Slang</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile.commonWords.map((w, i) => (
                    <span key={w} className="text-xs px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/50">{w}</span>
                  ))}
                </div>
              </div>

              <button onClick={save}
                className="w-full mt-5 py-3.5 rounded-xl font-display font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}>
                Save & Start Chatting →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
