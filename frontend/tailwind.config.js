/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#090D14",
        surface: "#111827",
        "surface-card": "#172033",
        "surface-card-hover": "#1E2A42",
        "border-subtle": "#233047",
        "accent-volt": "#10B981",
        "accent-volt-hover": "#059669",
        "accent-cyan": "#06B6D4",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
