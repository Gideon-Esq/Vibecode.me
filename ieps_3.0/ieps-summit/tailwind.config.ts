import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0D1B5E",
          light: "#1a2d8a",
          dark: "#080f3a",
          50: "#E7E9F5",
          100: "#C3C8E6",
          900: "#0D1B5E",
          950: "#080f3a",
        },
        gold: {
          DEFAULT: "#F5C400",
          light: "#FFD740",
          dark: "#C49B00",
          400: "#FFD740",
          500: "#F5C400",
          600: "#C49B00",
        },
        green: {
          DEFAULT: "#1A7A3C",
          light: "#22A050",
          dark: "#115228",
          400: "#22A050",
          500: "#1A7A3C",
          600: "#115228",
        },
        // alias retained for backward-compatible class names
        emerald: {
          DEFAULT: "#1A7A3C",
          400: "#22A050",
          500: "#1A7A3C",
          600: "#115228",
        },
        offwhite: "#F8F8F4",
        ink: "#1A1A2E",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
        label: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
        // alias retained for backward-compatible class names
        accent: ["var(--font-barlow-condensed)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        prose: "70ch",
      },
      boxShadow: {
        card: "0 10px 40px -12px rgba(13, 27, 94, 0.18)",
        gold: "0 10px 30px -8px rgba(245, 196, 0, 0.45)",
        glow: "0 0 0 0 rgba(245, 196, 0, 0.5)",
      },
      backgroundImage: {
        "navy-radial":
          "radial-gradient(circle at 20% 20%, rgba(245,196,0,0.10), transparent 40%), radial-gradient(circle at 85% 0%, rgba(26,122,60,0.16), transparent 45%)",
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-32px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(245,196,0,0.45)" },
          "50%": { boxShadow: "0 0 28px 6px rgba(245,196,0,0.0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-18px) rotate(6deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        flipIn: {
          "0%": { transform: "rotateX(-90deg)", opacity: "0" },
          "100%": { transform: "rotateX(0deg)", opacity: "1" },
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.7s ease-out both",
        "slide-in-left": "slideInLeft 0.7s ease-out both",
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        shimmer: "shimmer 1.6s infinite",
        "flip-in": "flipIn 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
