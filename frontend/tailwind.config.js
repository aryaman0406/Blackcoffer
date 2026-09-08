/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: '#0B1220',
          panel: '#131B2E',
          'panel-glass': 'rgba(19, 27, 46, 0.75)',
          'panel-hover': '#18233C',
          text: '#ECE9E2',
          muted: '#8B93A7',
          accent: '#E8944A',
          'accent-glow': 'rgba(232, 148, 74, 0.25)',
          secondary: '#4FD1C5',
          'secondary-glow': 'rgba(79, 209, 197, 0.25)',
          border: '#26314A',
          'border-subtle': '#1B243B',
        },
      },
      fontFamily: {
        sans: ['"General Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"General Sans"', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px #26314A',
        'panel-raised': '0 10px 30px -5px rgba(0, 0, 0, 0.7), 0 0 0 1px #26314A',
        glow: '0 0 20px -3px rgba(232, 148, 74, 0.35)',
        'glow-teal': '0 0 20px -3px rgba(79, 209, 197, 0.35)',
      },
    },
  },
  plugins: [],
};
