import type { Config } from "tailwindcss";

// Sila official palette — navy + blue + gold premium fintech system.
//   #1A2B4D primary (navy)   #39546D trust      #6B8FA7 stability
//   #DCE3EB surface          #F1F3F6 background  #D4AF37 gold (accent)
// New semantic tokens are the going-forward names; the legacy aliases
// (navy/lavender/dark-purple/pink-purple/light-gray) are remapped onto the
// new palette so existing markup renders correctly while screens migrate.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Semantic (preferred)
        primary: "#1A2B4D",
        trust: "#39546D",
        stability: "#6B8FA7",
        surface: "#DCE3EB",
        mist: "#F1F3F6",
        gold: "#D4AF37",
        "gold-dark": "#B8952B",
        // Legacy aliases → new palette
        navy: "#1A2B4D",
        "light-gray": "#DCE3EB",
        lavender: "#DCE3EB",
        "dark-purple": "#39546D",
        "pink-purple": "#39546D",
      },
      backgroundImage: {
        "gradient-navy": "linear-gradient(135deg, #1A2B4D 0%, #39546D 100%)",
        "gradient-purple": "linear-gradient(135deg, #39546D 0%, #6B8FA7 100%)",
        "gradient-pink": "linear-gradient(135deg, #1A2B4D 0%, #6B8FA7 100%)",
        "gradient-gold": "linear-gradient(135deg, #D4AF37 0%, #B8952B 100%)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
