/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Parchment Surfaces ── */
        parchment: {
          50:  '#FEFCF7',
          100: '#FDF8EE',
          200: '#FAF0DC',
          300: '#F3E4C4',
          400: '#E8D5A8',
          500: '#D4BC82',
          600: '#BFA264',
        },
        /* ── Dark Wood ── */
        wood: {
          50:  '#F5EDE3',
          100: '#E8D8C4',
          200: '#C9A87C',
          300: '#8B6914',
          400: '#6B4F36',
          500: '#4A3728',
          600: '#3D2E21',
          700: '#2D1F15',
          800: '#221811',
          900: '#1A120D',
          950: '#120C08',
        },
        /* ── Brass / Gold Accents ── */
        brass: {
          50:  '#FFF9E8',
          100: '#FFEFC2',
          200: '#FFE08A',
          300: '#FFD054',
          400: '#D4A847',
          500: '#C8A24A',
          600: '#A8862E',
          700: '#876B1E',
          800: '#654F14',
        },
        /* ── Ink (text) ── */
        ink: {
          50:  '#F5F3F0',
          100: '#E8E4DE',
          200: '#C9C2B6',
          300: '#A49A8A',
          400: '#7A6E5D',
          500: '#5C5144',
          600: '#3E342A',
          700: '#2C1F14',
          800: '#1A1410',
        },
        /* ── Status Colors (muted, vintage) ── */
        'v-success':  '#2D7D46',
        'v-warning':  '#C48B18',
        'v-error':    '#B33A3A',
        'v-info':     '#3A6B9F',
        /* ── Utility ── */
        'warm-border':  '#E8DFD0',
        'warm-border-light': '#F0E8D8',
      },
      fontFamily: {
        serif:    ['"Playfair Display"', 'Georgia', 'serif'],
        sans:     ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        /* Display */
        'display-xl':  ['2.5rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-lg':  ['2rem', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display-md':  ['1.5rem', { lineHeight: '1.3', fontWeight: '700', letterSpacing: '-0.01em' }],
        /* Headings */
        'heading-lg':  ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md':  ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm':  ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
        /* Body */
        'body-lg':     ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md':     ['0.875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm':     ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-xs':     ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
        /* Labels */
        'label-md':    ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-sm':    ['0.75rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.04em' }],
        'label-caps':  ['0.6875rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.06em' }],
      },
      spacing: {
        'sidebar':       '272px',
        'sidebar-sm':    '80px',
        'header':        '64px',
        'page':          '2rem',
        'card':          '1.5rem',
        'gutter':        '1.5rem',
      },
      borderRadius: {
        'vintage':   '12px',
        'vintage-sm': '8px',
        'vintage-lg': '16px',
      },
      boxShadow: {
        'card':      '0 2px 8px rgba(44, 31, 20, 0.06), 0 1px 3px rgba(44, 31, 20, 0.04)',
        'card-hover':'0 8px 24px rgba(44, 31, 20, 0.10), 0 2px 8px rgba(44, 31, 20, 0.06)',
        'elevated':  '0 12px 32px rgba(44, 31, 20, 0.14), 0 4px 12px rgba(44, 31, 20, 0.08)',
        'brass':     '0 2px 8px rgba(200, 162, 74, 0.25)',
        'inner-glow':'inset 0 1px 2px rgba(255, 255, 255, 0.5)',
        'modal':     '0 24px 64px rgba(26, 18, 13, 0.3), 0 8px 24px rgba(26, 18, 13, 0.15)',
      },
      backgroundImage: {
        'wood-gradient':     'linear-gradient(180deg, #2D1F15 0%, #1A120D 100%)',
        'brass-gradient':    'linear-gradient(135deg, #D4A847 0%, #C8A24A 50%, #A8862E 100%)',
        'brass-gradient-h':  'linear-gradient(135deg, #E8C45A 0%, #D4A847 50%, #C8A24A 100%)',
        'parchment-gradient':'linear-gradient(180deg, #FEFCF7 0%, #FDF8EE 100%)',
        'card-gradient':     'linear-gradient(180deg, #FFFDF8 0%, #FDF8EE 100%)',
      },
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-warm': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in':     'fade-in 0.3s ease-out',
        'fade-in-up':  'fade-in-up 0.4s ease-out',
        'scale-in':    'scale-in 0.2s ease-out',
        'slide-right': 'slide-right 0.3s ease-out',
        'slide-left':  'slide-left 0.3s ease-out',
        'shimmer':     'shimmer 1.5s ease-in-out infinite',
        'pulse-warm':  'pulse-warm 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
