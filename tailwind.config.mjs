/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/frontend/components/**/*.{js,ts,jsx,tsx,mdx}",
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
      colors: {
        // Tema Light: Cores fixas para modo claro
        light: {
          background: "#FFFFFF",
          "background-sidebar": "#F5F5F5",
          "background-form": "#FFFFFF",
          "background-form-secondary": "#E5E7EB",
          "background-table": "#F9FAFB",
          "background-table-header": "#EDEFF2",

          "background-card": "#FFFFFF",
          text: "#1F2937",
          "text-label": "#4B5563",
          "text-placeholder": "#9CA3AF",
          "text-table": "#374151",
          "text-button": "#FFFFFF",
          "text-error": "#DC2626",
          primary: "#3B82F6",
          "primary-dark": "#1D4ED8",
          secondary: "#10B981",
          "secondary-dark": "#047857",
          accent: "#6B7280",
          border: "#D1D5DB",
          "border-focus": "#3B82F6",
          muted: "#6B7280",
          danger: "#EF4444",
          "danger-dark": "#B91C1C",
          icon: "#4B5563",
        },
        // Tema Dark: Cores fixas para modo escuro
        dark: {
          background: "#1A202C", // Um cinza escuro mais suave
          "background-sidebar": "#2D3748", // Tom mais claro e elegante para a sidebar
          "background-form": "#2D3748", // Formulário com fundo mais distinto
          "background-form-secondary": "#4A5568", // Secundário mais claro
          "background-table": "#1F2937", // Mantido, mas ajustável
          "background-table-header": "#374151", // Cabeçalho mais destacado
          "background-card": "#2D3748", // Cards com fundo sutil

          text: "#E2E8F0", // Texto claro, mas não puro branco
          "text-label": "#A0AEC0", // Labels com tom mais suave
          "text-placeholder": "#718096", // Placeholder discreto
          "text-table": "#CBD5E0", // Texto da tabela com bom contraste
          "text-button": "#FFFFFF", // Botões com texto branco puro
          "text-error": "#F687B3", // Erro mais suave e legível

          primary: "#63B3ED", // Azul mais vibrante e claro
          "primary-dark": "#3182CE", // Tom escuro complementar
          secondary: "#48BB78", // Verde mais natural
          "secondary-dark": "#2F855A", // Verde escuro harmonioso
          accent: "#A0AEC0", // Acentuação neutra
          border: "#4A5568", // Bordas mais suaves
          "border-focus": "#63B3ED", // Foco alinhado ao primary
          muted: "#718096", // Tom apagado para elementos secundários
          danger: "#F687B3", // Vermelho rosado, menos agressivo
          "danger-dark": "#E53E3E", // Vermelho escuro mais intenso
          icon: "#A0AEC0", // Ícones com tom neutro e claro
        },
      },
    },
  },
  plugins: [],
  darkMode: "class", // Permite alternância manual via classe
};
