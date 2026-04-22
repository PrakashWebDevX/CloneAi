import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePersonalities } from '../context/PersonalityContext';
import toast from 'react-hot-toast';

const TAG_COLORS = [
  'bg-purple-500/10 text-purple-300 border-purple-500/20',
  'bg-pink-500/10 text-pink-300 border-pink-500/20',
  'bg-teal-500/10 text-teal-300 border-teal-500/20',
  'bg-amber-500/10 text-amber-300 border-amber-500/20',
];

export default function DashboardPage() {
  const { personalities, deletePersonality, loadDemos, setActivePersonality } = usePersonalities();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);

  function chatWith(p) {
    setActivePersonality(p);
    navigate('/chat');
  }

  function handleExport(p) {
    const json = JSON.stringify(p, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.name.replace(/\s+/g, '_')}_personality.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Personality exported!');
  }

  function confirmDelete(id) {
    setConfirmId(id);
  }

  function doDelete() {
    deletePersonality(confirmId);
    setConfirmId(null);
    toast.success('Personality deleted');
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl mb-1">My Personalities</h1>
          <p className="text-white/40 text-sm">{personalities.length} clone{personalities.length !== 1 ? 's' : ''} saved</p>
        </div>
        <div className="flex gap-2">
          {!personalities.length && (
            <button onClick={loadDemos}
              className="px-4 py-2 rounded-lg border border-white/10 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              Load Demos
            </button>
          )}
          <button onClick={() => navigate('/train')}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}>
            + New Personality
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!personalities.length && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24 border border-dashed border-white/10 rounded-2xl"
        >
          <div className="text-5xl mb-4 opacity-30">🧠</div>
          <p className="text-white/40 mb-2">No personalities yet</p>
          <p className="text-white/20 text-sm mb-6">Train your first AI clone in minutes</p>
          <button onClick={() => navigate('/train')}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7c6bfc, #f472b6)' }}>
            Create First Clone →
          </button>
        </motion.div>
      )}

      {/* Personality grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      >
        <AnimatePresence>
          {personalities.map((p) => (
            <motion.div
              key={p.id}
              variants={{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              exit={{ scale: 0.95, opacity: 0 }}
              whileHover={{ y: -2 }}
              className="rounded-2xl p-5 border border-white/[0.08] cursor-pointer group"
              style={{ background: '#111118' }}
            >
              {/* Avatar + name */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(124,107,252,0.12)' }}>
                  {p.emoji}
                </div>
                <span className="text-xs text-white/20 border border-white/[0.06] px-2 py-0.5 rounded-full">
                  {p.tone}
                </span>
              </div>

              <h3 className="font-display font-semibold mb-1">{p.name}</h3>
              <p className="text-xs text-white/30 mb-3 leading-relaxed line-clamp-2">
                {p.personality || `${p.avgSentenceLength} sentences · ${p.traits.length} traits`}
              </p>

              {/* Trait tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {p.traits.slice(0, 3).map((t, i) => (
                  <span key={t} className={`text-xs px-2 py-0.5 rounded-full border ${TAG_COLORS[i % TAG_COLORS.length]}`}>
                    {t}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => chatWith(p)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium text-purple-300 border border-purple-500/20 hover:bg-purple-500/10 transition-colors">
                  💬 Chat
                </button>
                <button onClick={() => handleExport(p)}
                  className="py-2 px-3 rounded-lg text-xs font-medium text-white/40 border border-white/[0.08] hover:bg-white/5 transition-colors">
                  ↓
                </button>
                <button onClick={() => confirmDelete(p.id)}
                  className="py-2 px-3 rounded-lg text-xs font-medium text-white/30 border border-white/[0.08] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors">
                  🗑
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add new card */}
        <motion.div
          variants={{ hidden: { y: 16, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
          whileHover={{ y: -2 }}
          onClick={() => navigate('/train')}
          className="rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 p-8 cursor-pointer hover:border-purple-500/30 hover:bg-purple-500/[0.03] transition-all group"
          style={{ minHeight: '200px' }}>
          <span className="text-2xl opacity-20 group-hover:opacity-50 transition-opacity">＋</span>
          <span className="text-sm text-white/20 group-hover:text-white/40 transition-colors">New Personality</span>
        </motion.div>
      </motion.div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="rounded-2xl p-6 max-w-sm w-full border border-white/10"
              style={{ background: '#16161f' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-display font-bold text-lg mb-2">Delete Personality?</h3>
              <p className="text-white/40 text-sm mb-6">This action cannot be undone. All chat history for this clone will be lost.</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConfirmId(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 text-sm hover:bg-white/5 transition-colors">
                  Cancel
                </button>
                <button onClick={doDelete}
                  className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
