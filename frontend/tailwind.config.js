/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080c14",
        card: "#0f172a",
        "card-hover": "#1e293b",
        border: "#1e293b",
        "border-light": "#334155",
        brand: {
          50: '#ecfeff',
          500: '#06b6d4',
          600: '#0891b2',
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
