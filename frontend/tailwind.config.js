/** @type {import('tailwindcss').Config} */
const path = require('path');

module.exports = {
  content: [path.join(__dirname, 'index.html'), path.join(__dirname, 'src/**/*.{js,jsx}')],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#edf2f7',
          surface: '#ffffff',
          line: '#d7e2eb',
          accent: '#0f8f8d',
          accentDark: '#0a6f6d',
          ink: '#15253b',
          muted: '#5f7287',
          nav: '#0f1f33'
        }
      },
      boxShadow: {
        soft: '0 20px 50px -28px rgba(10, 31, 61, 0.35)'
      },
      borderRadius: {
        app: '1.25rem'
      }
    }
  },
  plugins: []
};
