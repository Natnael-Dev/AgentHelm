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
        background: "#090d16",
        surface: "#0f172a",
        border: "#1e293b",
        primary: {
          50: "#f0fdf4",
          500: "#22c55e",
          600: "#16a34a",
        },
        danger: {
          500: "#ef4444",
          600: "#dc2626",
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
