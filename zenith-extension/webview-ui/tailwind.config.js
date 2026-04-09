/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0d0d0f',
        surface: '#141416',
        elevated: '#1c1c1f',
        hover: '#242428',
        active: '#2a2a30',
        accent: {
          DEFAULT: '#00F0FF',
          dim: 'rgba(0, 240, 255, 0.15)',
        },
        'text-primary': '#f0f0f2',
        'text-secondary': '#8a8a9a',
        'text-muted': '#4a4a5a',
      },
      fontFamily: {
        ui: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '10px',
      },
    },
  },
  plugins: [],
}
