/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#1a1b2d", // deep navy background from references
          card: "#22243d", // card background
          cardHover: "#2a2d4b",
          border: "rgba(255, 255, 255, 0.08)",
          text: "#f1f5f9", // slate-100
          textMuted: "#94a3b8", // slate-400
          accent: "#fbbf24", // amber yellow
          accent2: "#a855f7", // purple accent
          accent3: "#3b82f6", // blue accent
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
