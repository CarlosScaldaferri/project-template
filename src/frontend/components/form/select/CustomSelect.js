import { useCallback, useMemo } from "react";
import PropTypes from "prop-types";

const BASE_STYLES =
  "w-full px-4 py-2 text-base bg-light-background-sidebar dark:bg-dark-background-sidebar text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-md focus:border-light-border-focus dark:focus:border-dark-border-focus focus:ring-2 focus:ring-light-border-focus dark:focus:ring-dark-border-focus focus:outline-none transition-all duration-200 ease-in-out disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

/**
 * Componente de select personalizado com tratamento de erros
 * @param {Object} props - Propriedades do componente
 * @param {string} props.label - Texto da label do select
 * @param {string} props.name - Nome do select
 * @param {string} [props.value=""] - Valor selecionado
 * @param {Function} props.onChange - Função a ser chamada quando o valor do select mudar
 * @param {boolean} [props.disabled] - Se o select está desabilitado
 * @param {Array<{value: string, label: string}>} props.options - Opções do select
 * @param {string} [props.className=""] - Classes CSS adicionais
 * @param {string} [props.error] - Mensagem de erro a ser exibida
 * @returns {JSX.Element} Componente de select personalizado
 */
export default function CustomSelect({
  label,
  name,
  value = "",
  onChange,
  disabled,
  options,
  className = "",
  error,
}) {
  // Gera um ID único para o select
  const selectId = useMemo(
    () =>
      `select-${label?.replace(/\s+/g, "-")?.toLowerCase() || "custom"}-${Math.random().toString(36).substring(2, 9)}`,
    [label]
  );

  // Classes do select
  const selectClasses = [
    BASE_STYLES,
    error ? "border-light-danger dark:border-dark-danger" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * Manipula mudanças no select com tratamento de erros
   * @param {Event} e - Evento de mudança
   */
  const handleChange = useCallback(
    (e) => {
      try {
        if (typeof onChange === "function") {
          onChange(e);
        }
      } catch (error) {
        console.error(`Erro ao processar mudança no select ${label}:`, error);
      }
    },
    [onChange, label]
  );

  // Verifica se as opções são válidas
  const validOptions = useMemo(() => {
    if (!Array.isArray(options)) {
      console.error(`Opções inválidas para o select ${label}:`, options);
      return [];
    }
    return options;
  }, [options, label]);

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={selectId}
        className="text-base text-light-text-label dark:text-dark-text-label transition-colors duration-200 ease-in-out"
      >
        {label}
      </label>
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : undefined}
      >
        {/* Adiciona uma opção padrão "Selecione..." se value inicial for "" */}
        {!value && (
          <option value="" disabled>
            Selecione...
          </option>
        )}

        {validOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          id={`${selectId}-error`}
          className="text-sm text-light-text-error dark:text-dark-text-error mt-1"
        >
          {error}
        </span>
      )}
    </div>
  );
}

CustomSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
};
