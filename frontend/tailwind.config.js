/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ground: "#0a0b0e",
        surface: "#111216",
        "surface-card": "#15171d",
        raised: "#1a1c24",
        active: "#21242e",
        border: "#242733",
        rule: "#1c1e27",
        control: "#2d303f",
        text: "#ededef",
        muted: "#8a8f9f",
        faint: "#5a5e6d",
        primary: "#ffffff",
        "primary-ink": "#0a0b0e",
        positive: "#10b981",
        negative: "#f43f5e",
        warning: "#f59e0b",
        accent: "#3b82f6",
      },
      fontFamily: {
        sans: ['Geist', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: "8px",
        control: "6px",
      },
    },
  },
  plugins: [],
}
