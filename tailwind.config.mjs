/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "sans-serif"],
      },

      colors: {
        light: {
          background: "#C4C4C4", // Cinza escuro para o fundo principal (tom mais forte)
          "background-sidebar": "#F5F5F5", // Cinza muito claro para a barra lateral
          "background-form-primary": "#FFFFFF", // Branco puro para formulários principais
          "background-form-secondary": "#E0E0E0", // Cinza médio para formulários secundários (mais escuro que a sidebar)
          text: "#212121", // Preto quase absoluto para o texto
          primary: "#6200EE", // Roxo para elementos primários
          "primary-dark": "#3700B3", // Roxo escuro para estado ativo
          secondary: "#03DAC6", // Ciano para elementos secundários
          "secondary-dark": "#018786", // Ciano escuro para estado ativo
          accent: "#757575", // Cinza médio para elementos de destaque
          border: "#9E9E9E", // Cinza neutro para bordas
          muted: "#7D7D7D", // Cinza suave para elementos menos destacados
          danger: "#B00020", // Vermelho para erros
          "danger-dark": "#790000", // Vermelho escuro para estado ativo
        },
        dark: {
          background: "#1E2A38", // Azul acinzentado escuro para fundo principal (tom forte e profundo)
          "background-sidebar": "#0F1722", // Azul muito escuro para a barra lateral
          "background-form-primary": "#0A0F1A", // Azul quase preto para formulários principais
          "background-form-secondary": "#2A3A4E", // Azul acinzentado mais claro para formulários secundários (contraste com sidebar)
          text: "#E0E6ED", // Azul claro acinzentado para texto (quase branco, mas com toque azulado)
          primary: "#42A5F5", // Azul vibrante para elementos primários (equivalente ao roxo claro)
          "primary-dark": "#1976D2", // Azul escuro para estado ativo
          secondary: "#4FC3F7", // Azul celeste para elementos secundários (leve variação do primário)
          "secondary-dark": "#0288D1", // Azul médio escuro para estado ativo
          accent: "#90CAF9", // Azul claro suave para elementos de destaque
          border: "#546E7A", // Azul acinzentado escuro para bordas
          muted: "#78909C", // Azul acinzentado neutro para elementos menos destacados
          danger: "#EF5350", // Vermelho suave para erros (mantido similar ao original por ser uma cor de alerta)
          "danger-dark": "#C62828", // Vermelho escuro para estado ativo
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
