/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── "A Beautiful Blur" era palette ───────────────
        midnight: "#11101C", // primary canvas — deep indigo-charcoal
        surface: "#161426", //  secondary surface — muted slate-indigo
        "surface-2": "#1E1B33", // raised cards / hover states
        line: "#2A2647", //      hairline borders
        neon: {
          DEFAULT: "#1A52FF", // accent — aesthetic cobalt blue
          soft: "#5C82FF", //    hover / lighter glow
          dim: "#10339E", //     pressed / muted
        },
        electric: "#00E5FF", //  electric cyan — glow text & highlights
        violet: "#8B7BFF", //    secondary synth glow
        mist: "#A6A0BD", //      muted lavender-blue body text
        ice: "#F4F1F8", //       near-white headings
        mint: "#5EEAD4", //      success / "code strings" accent
      },
      fontFamily: {
        // Cabinet Grotesk loads from Fontshare; Plus Jakarta Sans is the
        // bundled fallback so headings never flash a system font.
        display: ["Cabinet Grotesk", "var(--font-body)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        // Blue neon glow utilities — buttons, active track nodes, focus rings
        glow: "0 0 20px rgba(26, 82, 255, 0.4), 0 0 60px rgba(26, 82, 255, 0.15)",
        "glow-lg": "0 0 30px rgba(26, 82, 255, 0.55), 0 0 90px rgba(0, 229, 255, 0.18)",
        "glow-electric": "0 0 20px rgba(0, 229, 255, 0.35), 0 0 60px rgba(0, 229, 255, 0.12)",
        "glow-violet": "0 0 24px rgba(139, 123, 255, 0.3)",
        "glow-mint": "0 0 20px rgba(94, 234, 212, 0.3)",
      },
      dropShadow: {
        // Electric text glow, e.g. class="text-electric drop-shadow-neon"
        neon: "0 0 10px rgba(0, 229, 255, 0.6)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.92" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-7px)" },
        },
      },
      animation: {
        breathe: "breathe 3.4s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 3.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
