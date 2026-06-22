/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },

        secondary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          950: "#3b0764",
        },

        success: {
          50: "#ecfdf5",
          100: "#d1fae5",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },

        warning: {
          50: "#fffbeb",
          100: "#fef3c7",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },

        danger: {
          50: "#fef2f2",
          100: "#fee2e2",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
        },

        info: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },

      spacing: {
        18: "4.5rem",
        88: "22rem",
        128: "32rem",
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.05)",
        medium: "0 8px 20px rgba(0,0,0,0.08)",
        large: "0 15px 35px rgba(0,0,0,0.12)",
      },

      animation: {
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "#c084fc transparent",
        },

        ".scrollbar-thin::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },

        ".scrollbar-thin::-webkit-scrollbar-track": {
          background: "transparent",
        },

        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          backgroundColor: "#c084fc",
          borderRadius: "3px",
        },
      });
    },
  ],
};