import { useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { ClipLoader } from "react-spinners";

const BASE_STYLES =
  "px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center gap-2";

const VARIANTS = {
  primary: {
    bg: "bg-light-primary dark:bg-dark-primary",
    text: "text-light-text-button dark:text-dark-text-button",
    hover: "hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark",
    focus: "focus:ring-light-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
  secondary: {
    bg: "bg-light-secondary dark:bg-dark-secondary",
    text: "text-light-text-button dark:text-dark-text-button",
    hover: "hover:bg-light-secondary-dark dark:hover:bg-dark-secondary-dark",
    focus: "focus:ring-light-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
  danger: {
    bg: "bg-light-danger dark:bg-dark-danger",
    text: "text-light-text-button dark:text-dark-text-button",
    hover: "hover:bg-light-danger-dark dark:hover:bg-dark-danger-dark",
    focus: "focus:ring-light-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
};

/**
 * Componente de botão personalizado com tratamento de erros
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Conteúdo do botão
 * @param {string} [props.className=""] - Classes CSS adicionais
 * @param {string} [props.variant="primary"] - Variante do botão (primary, secondary, danger)
 * @param {boolean} [props.isLoading=false] - Se o botão está em estado de carregamento
 * @param {string} [props.loadingText=""] - Texto a ser exibido durante o carregamento
 * @param {Function} [props.onClick] - Função a ser chamada quando o botão for clicado
 * @param {string} [props.type="button"] - Tipo do botão (button, submit, reset)
 * @param {boolean} [props.disabled] - Se o botão está desabilitado
 * @param {Object} props.rest - Outras propriedades a serem passadas para o botão
 * @returns {JSX.Element} Componente de botão personalizado
 */
export default function CustomButton({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  loadingText = "",
  onClick,
  type = "button",
  ...props
}) {
  // Verifica se a variante é válida
  const safeVariant = useMemo(() => {
    if (!VARIANTS[variant]) {
      console.warn(
        `Variante de botão inválida: ${variant}. Usando 'primary' como fallback.`
      );
      return "primary";
    }
    return variant;
  }, [variant]);

  // Obtém os estilos da variante
  const variantStyles = VARIANTS[safeVariant];

  // Combina os estilos
  const styles = clsx(
    BASE_STYLES,
    variantStyles.bg,
    variantStyles.text,
    variantStyles.hover,
    variantStyles.focus,
    className,
    {
      "opacity-75": isLoading,
    }
  );

  /**
   * Manipula cliques no botão com tratamento de erros
   * @param {Event} e - Evento de clique
   */
  const handleClick = useCallback(
    (e) => {
      try {
        if (typeof onClick === "function" && !isLoading && !props.disabled) {
          onClick(e);
        }
      } catch (error) {
        console.error("Erro ao processar clique no botão:", error);
      }
    },
    [onClick, isLoading, props.disabled]
  );

  // Gera um ID único para o botão para acessibilidade
  const buttonId = useMemo(
    () => `btn-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  return (
    <button
      id={buttonId}
      type={type}
      onClick={handleClick}
      className={styles}
      disabled={isLoading || props.disabled}
      aria-busy={isLoading}
      aria-disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <ClipLoader
            size={18}
            color={variantStyles.loadingColor}
            className="mr-2"
            aria-hidden="true"
          />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  isLoading: PropTypes.bool,
  loadingText: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
};
