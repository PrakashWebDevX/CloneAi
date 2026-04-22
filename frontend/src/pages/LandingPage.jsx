import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePersonalities } from '../context/PersonalityContext';

const features = [
  { icon: '🎯', title: 'Personality Analysis', desc: 'Extracts tone, slang, sentence patterns & quirks from your raw chat data.', color: 'rgba(124,107,252,0.12)' },
  { icon: '💬', title: 'Real-Time Chat', desc: 'Chat with your AI twin powered by Claude with typing animations & voice input.', color: 'rgba(244,114,182,0.12)' },
  { icon: '🎭', title: 'Personality Modes', desc: 'Switch between Chill, Professional & Angry modes dynamically on the fly.', color: 'rgba(45,212,191,0.12)' },
  { icon: '🎤', title: 'Voice Input', desc: 'Speak to your clone using Web Speech API — fully hands-free chatting.', color: 'rgba(251,191,36,0.12)' },
  { icon: '📦', title: 'Multi-Personality', desc: 'Save, name, and switch between multiple personality clones.', color: 'rgba(74,222,128,0.1)' },
  { icon: '📤', title: 'Export & Share', desc: 'Export your personality profile as JSON and share it with others.', color: 'rgba(248,113,113,0.1)' },
];

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

export default function LandingPage() {
  const navigate = useNavigate();
  const { loadDemos } = usePersonalities();

  function handleDemo() {
    loadDemos();
    navigate('/chat');
  }

  return (
    <main>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 900px 600px at 50% 20%, rgba(124,107,252,0.1) 0%, transparent 70%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-widest uppercase mb-8">
            ✦ Powered by Claude AI
          </div>

          <h1 className="font-display font-extrabold leading-[1.05] mb-6"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
            Clone Your <span className="gradient-text">Personality</span><br />
            Into an AI Twin
          </h1>

          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Paste your chats, train an AI that thinks and talks exactly like you —
            same slang, same tone, same vibe. Then chat with your digital clone.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/train')}
              className="px-7 py-3 rounded-xl font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}
            >
              Create Your Clone →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDemo}
              className="px-7 py-3 rounded-xl font-semibold border border-white/10 hover:bg-white/5 transition-colors"
            >
              Try Demo First
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] border border-white/[0.06] rounded-2xl overflow-hidden"
        >
          {features.map((f) => (
            <motion.div key={f.title} variants={item}
              className="p-7 hover:bg-white/[0.03] transition-colors"
              style={{ background: '#111118' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className="font-display font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA Strip */}
      <section className="mx-6 mb-16 rounded-2xl overflow-hidden border border-white/[0.07]"
        style={{ background: 'linear-gradient(135deg, rgba(124,107,252,0.12) 0%, rgba(244,114,182,0.08) 100%)' }}>
        <div className="text-center py-14 px-6">
          <h2 className="font-display font-bold text-2xl mb-3">Ready to meet your digital twin?</h2>
          <p className="text-white/50 mb-6">It takes less than 2 minutes to train your first personality.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/train')}
            className="px-8 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}>
            Start Training Now →
          </motion.button>
        </div>
      </section>
    </main>
  );
}
