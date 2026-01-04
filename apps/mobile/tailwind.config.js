/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../../libs/ui/src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // EmuZ Emerald Green Theme
        primary: {
          DEFAULT: '#10B981', // Emerald 500
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        background: {
          DEFAULT: '#0F172A', // Slate 900
          light: '#1E293B',   // Slate 800
          lighter: '#334155', // Slate 700
        },
        surface: {
          DEFAULT: '#1E293B', // Slate 800
          light: '#334155',   // Slate 700
        },
        text: {
          primary: '#F1F5F9',   // Slate 100
          secondary: '#94A3B8', // Slate 400
          muted: '#64748B',     // Slate 500
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['JetBrains Mono', 'Courier'],
      },
    },
  },
  plugins: [],
};
