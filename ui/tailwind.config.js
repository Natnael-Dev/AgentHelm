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
        void: "#0E0D0B",
        charcoal: "#171512",
        panel: "#171512",
        panelHeader: "#0F0E0C",
        cardDark: "#0A0906",
        borderDark: "#2A2721",
        borderSubtle: "#1E1C19",
        cream: "#EDE6D6",
        ink: "#14120E",
        bone: "#8A8578",
        dimText: "#4A4640",
        orangeAccent: "#E4572E",
        greenAccent: "#8AB661",
        amberAccent: "#E8A33D",
        redAccent: "#D64533",
      },
      fontFamily: {
        serif: ['"Fraunces"', 'serif'],
        mono: ['"Space Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        sans: ['"Archivo"', 'sans-serif'],
      },
      boxShadow: {
        hard: "4px 4px 0 #000",
        hardSm: "2px 2px 0 #000",
      }
    },
  },
  plugins: [],
}
