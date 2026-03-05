/**
 * tailwind.config.js — Configurazione Tailwind CSS
 */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colori custom app
        primary: '#d4a574',
        dark: '#5a3a2a',
        medium: '#8b5a3c',
        light: '#faf3f0',
        border: '#e8d5c4',
      },
    },
  },
  plugins: [],
};
