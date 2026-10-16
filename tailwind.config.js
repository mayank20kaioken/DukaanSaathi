/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1320', // Deepest background
          900: '#101B2D', // Primary background
          850: '#142236',
          800: '#17263A', // Secondary surface
          750: '#1A2C42',
          700: '#1D3043', // Elevated cards
          650: '#233950',
          600: '#2A435D',
          500: '#3D5E82',
          400: '#5A7EAA',
        },
        lime: {
          accent: '#C7F36B', // Electric lime
          hover: '#B8EA55',
          muted: '#8FB443',
          soft: 'rgba(199, 243, 107, 0.12)',
          glow: 'rgba(199, 243, 107, 0.25)',
        },
        mint: {
          accent: '#55C6A9', // Forest mint
          hover: '#42B597',
          soft: 'rgba(85, 198, 169, 0.12)',
          glow: 'rgba(85, 198, 169, 0.25)',
        },
        workspace: {
          bg: '#F5F7F2',
          card: '#FFFFFF',
          cardSubtle: '#F8FAF6',
          text: '#17221D',
          muted: '#526059',
          border: '#E2E8F0',
          borderSubtle: '#EDF2E8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'Inter', 'sans-serif'],
        display: ['Manrope', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'surface-dark': '0 4px 20px -2px rgba(5, 10, 18, 0.4), 0 2px 6px -1px rgba(0, 0, 0, 0.2)',
        'elevated-dark': '0 12px 32px -4px rgba(0, 0, 0, 0.5), 0 4px 12px -2px rgba(0, 0, 0, 0.3)',
        'lime-glow': '0 0 20px -2px rgba(199, 243, 107, 0.3)',
        'mint-glow': '0 0 20px -2px rgba(85, 198, 169, 0.3)',
        'surface-light': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'elevated-light': '0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
