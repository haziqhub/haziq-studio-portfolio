/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: '#f5f5f3',
        paper: '#ffffff',
        charcoal: '#0f0f12',
        graphite: '#1c1c21',
        muted: '#71717a',
        accent: '#2563eb',
      },
      fontFamily: {
        display: ['Cabinet Grotesk', 'Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}