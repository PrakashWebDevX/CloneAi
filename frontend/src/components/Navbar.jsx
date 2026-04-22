import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-bg-4 text-white border border-white/10'
        : 'text-white/50 hover:text-white hover:bg-bg-3'
    }`;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 border-b border-white/[0.07] bg-bg/90 backdrop-blur-xl"
    >
      <NavLink to="/" className="flex items-center gap-2">
        <span className="text-xl">🧠</span>
        <span className="font-display font-extrabold text-lg gradient-text">CloneAI</span>
      </NavLink>

      <div className="flex items-center gap-1">
        <NavLink to="/" end className={linkClass}>Home</NavLink>
        <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        <NavLink to="/train" className={linkClass}>Train</NavLink>
        <NavLink to="/chat" className={linkClass}>Chat</NavLink>
      </div>
    </motion.nav>
  );
}
