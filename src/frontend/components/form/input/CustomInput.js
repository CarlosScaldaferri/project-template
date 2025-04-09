import { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

// Estilos base para inputs que não são checkbox
const BASE_INPUT_STYLES =
  "w-full px-4 py-2 text-base bg-light-background-sidebar dark:bg-dark-background-sidebar text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-md focus:border-light-border-focus dark:focus:border-dark-border-focus focus:ring-2 focus:ring-light-border-focus dark:focus:ring-dark-border-focus focus:outline-none placeholder-light-text-placeholder dark:placeholder-dark-text-placeholder transition-all duration-200 ease-in-out disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

// Estilos específicos para o input checkbox
const CHECKBOX_INPUT_STYLES =
  "w-5 h-5 accent-light-accent dark:accent-dark-accent cursor-pointer rounded"; // Adicionado rounded para consistência visual

// Estilos para a label (comuns e específicos de checkbox)
const BASE_LABEL_STYLES =
  "text-base text-light-text-label dark:text-dark-text-label transition-colors duration-200 ease-in-out";
const CHECKBOX_LABEL_STYLES = "cursor-pointer select-none";

/**
 * Componente de input personalizado com tratamento de erros
 * @param {Object} props - Propriedades do componente
 * @param {string} props.label - Texto da label do input
 * @param {string} [props.className=""] - Classes CSS adicionais
 * @param {string} [props.error] - Mensagem de erro a ser exibida
 * @param {string} [props.type="text"] - Tipo do input (text, password, email, checkbox, etc.)
 * @param {string|number|boolean|Date} [props.value] - Valor do input
 * @param {Function} [props.onChange] - Função a ser chamada quando o valor do input mudar
 * @param {Object} props.rest - Outras propriedades a serem passadas para o input
 * @returns {JSX.Element} Componente de input personalizado
 */
export default function CustomInput({
  label,
  className = "",
  error,
  type = "text",
  value,
  onChange,
  ...props
}) {
  // Verifica se o input é do tipo checkbox
  const isCheckbox = type === "checkbox";

  // Gera um ID único para o input
  const inputId = useMemo(
    () =>
      `input-${label?.replace(/\s+/g, "-")?.toLowerCase() || "custom"}-${Math.random().toString(36).substring(2, 9)}`,
    [label]
  );

  /**
   * Manipula mudanças no input com tratamento de erros
   * @param {Event} e - Evento de mudança
   */
  const handleChange = useCallback(
    (e) => {
      try {
        if (typeof onChange === "function") {
          onChange(e);
        }
      } catch (error) {
        console.error(`Erro ao processar mudança no input ${label}:`, error);
      }
    },
    [onChange, label]
  );

  // Renderização para Checkbox
  if (isCheckbox) {
    return (
      <div className={`w-full flex items-center gap-2 ${className}`}>
        <input
          id={inputId}
          type="checkbox"
          onChange={handleChange}
          checked={!!value}
          className={`${CHECKBOX_INPUT_STYLES} ${error ? "ring-2 ring-light-danger dark:ring-dark-danger ring-offset-1" : ""}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={inputId}
          className={`${BASE_LABEL_STYLES} ${CHECKBOX_LABEL_STYLES}`}
        >
          {label}
        </label>
        {error && (
          <span
            id={`${inputId}-error`}
            className="text-sm text-light-text-error dark:text-dark-text-error ml-2"
          >
            {error}
          </span>
        )}
      </div>
    );
  }

  // Renderização para outros tipos de Input
  return (
    <div className="w-full flex flex-col gap-1">
      <label htmlFor={inputId} className={BASE_LABEL_STYLES}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value ?? ""}
        onChange={handleChange}
        className={[
          BASE_INPUT_STYLES,
          error ? "border-light-danger dark:border-dark-danger" : null,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${inputId}-error`}
          className="text-sm text-light-text-error dark:text-dark-text-error mt-1"
        >
          {error}
        </span>
      )}
    </div>
  );
}

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.bool,
    PropTypes.instanceOf(Date),
  ]),
  onChange: PropTypes.func,
};
