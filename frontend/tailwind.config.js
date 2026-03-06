export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50: "#eff6ff", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
        surface: { DEFAULT: "#ffffff", muted: "#f8fafc" },
      },
    },
  },
  plugins: [],
};
