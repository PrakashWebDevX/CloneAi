/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          2: '#111118',
          3: '#16161f',
          4: '#1c1c28'
        },
        accent: {
          DEFAULT: '#7c6bfc',
          2: '#a78bfa'
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          2: 'rgba(255,255,255,0.14)'
        }
      },
      animation: {
        'typing': 'typing 1.2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease',
        'fade-up': 'fadeUp 0.4s ease',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite'
      },
      keyframes: {
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-6px)' }
        },
        slideIn: {
          from: { transform: 'translateX(20px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' }
        },
        fadeUp: {
          from: { transform: 'translateY(12px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' }
        }
      }
    }
  },
  plugins: []
}
