/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
      },
      colors: {
        apple: {
          bgLight: '#FBFBFD',
          cardLight: '#FFFFFF',
          borderLight: '#E5E5EA',
          textLight: '#1D1D1F',
          subTextLight: '#86868B',
          bgDark: '#0D0D0E',
          cardDark: '#161618',
          borderDark: '#2C2C2E',
          textDark: '#F5F5F7',
          subTextDark: '#8E8E93',
          accent: '#0071E3',
          accentHover: '#0077ED',
        }
      },
      boxShadow: {
        'apple': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
        'apple-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'apple-lg': '0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};
