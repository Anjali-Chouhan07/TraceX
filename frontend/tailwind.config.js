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
        nexus: {
          950: '#040711',
          900: '#070d1e',
          850: '#0b142d',
          800: '#0f1c3f',
          750: '#142552',
          700: '#1b326d',
          card: '#0c152c',
          cardBorder: '#1c2d58',
          input: '#091024',
          accent: '#2563eb',
          cyan: '#00d2ff',
          crimson: '#ef4444',
          emerald: '#10b981',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      }
    },
  },
  plugins: [],
}
