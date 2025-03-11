/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },
      colors: {
        light: {
          background: "#FFFFFF",
          "background-sidebar": "#F5F5F5",
          "background-form-primary": "#FFFFFF",
          "background-form-secondary": "#E0E0E0",
          text: "#212121",
          primary: "#6200EE",
          "primary-dark": "#3700B3",
          secondary: "#03DAC6",
          "secondary-dark": "#018786",
          accent: "#757575",
          border: "#9E9E9E",
          muted: "#7D7D7D",
          danger: "#B00020",
          "danger-dark": "#790000",
        },
        dark: {
          background: "#1E2A38",
          "background-sidebar": "#0F1722",
          "background-form-primary": "#0A0F1A",
          "background-form-secondary": "#2A3A4E",
          text: "#E0E6ED",
          primary: "#42A5F5",
          "primary-dark": "#1976D2",
          secondary: "#4FC3F7",
          "secondary-dark": "#0288D1",
          accent: "#90CAF9",
          border: "#546E7A",
          muted: "#78909C",
          danger: "#EF5350",
          "danger-dark": "#C62828",
        },
      },
      backgroundImage: {
        "gradient-light": "linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)",
        "gradient-dark": "linear-gradient(180deg, #1E2A38 0%, #2A3A4E 100%)",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
