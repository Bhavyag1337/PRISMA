/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0F172A', // Slate 900
          card: '#1E293B', // Slate 800
          border: '#334155', // Slate 700
          text: '#F8FAFC', // Slate 50
          muted: '#94A3B8', // Slate 400
        },
        primary: {
          DEFAULT: '#3B82F6', // Blue 500
          hover: '#2563EB', // Blue 600
        },
        accent: {
          DEFAULT: '#8B5CF6', // Violet 500
        },
        success: {
          DEFAULT: '#10B981', // Emerald 500
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber 500
        },
        danger: {
          DEFAULT: '#EF4444', // Red 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
