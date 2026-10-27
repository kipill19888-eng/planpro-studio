/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // 👈 Включаем темную тему
  theme: {
    extend: {
      colors: {
        'sidebar': '#1e2330',
        'primary': '#2563eb',
        'bg-light': '#f8fafc',
        gray: {
          400: '#64748b',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
        }
      },
    },
  },
  plugins: [],
}