import { useState, useCallback } from "react";
import Image from "next/image";
import PropTypes from "prop-types";
import { FaImage, FaExclamationTriangle } from "react-icons/fa";

/**
 * Componente de imagem personalizado com tratamento de erros
 * @param {Object} props - Propriedades do componente
 * @param {string} props.src - URL da imagem
 * @param {string} props.alt - Texto alternativo para a imagem
 * @param {string} [props.className=""] - Classes CSS adicionais
 * @param {string} [props.error] - Mensagem de erro a ser exibida
 * @param {Function} [props.onError] - Função a ser chamada quando ocorrer um erro no carregamento da imagem
 * @param {Object} props.rest - Outras propriedades a serem passadas para o componente Image
 * @returns {JSX.Element} Componente de imagem personalizado
 */
export default function CustomImage({
  src,
  alt,
  className = "",
  error,
  onError,
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Classes condicionais para a Imagem
  const imageClasses = [
    "w-32 h-32",
    error || hasError ? "border-light-danger dark:border-dark-danger" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Classes condicionais para o placeholder
  const placeholderClasses = [
    "w-32 h-32 flex items-center justify-center",
    error || hasError ? "border-light-danger dark:border-dark-danger" : null,
  ]
    .filter(Boolean)
    .join(" ");

  /**
   * Manipula erros de carregamento da imagem
   * @param {Event} e - Evento de erro
   */
  const handleImageError = useCallback(
    (e) => {
      // Registra o erro no console
      const errorMsg = `Erro ao carregar imagem: ${src}`;
      console.error(errorMsg);
      setHasError(true);
      setErrorMessage("Falha ao carregar imagem");

      // Chama a função onError se fornecida
      if (typeof onError === "function") {
        onError(e);
      }
    },
    [src, onError]
  );

  // Valida a URL da imagem
  const isValidSrc = src && typeof src === "string" && src.trim() !== "";

  return (
    <div className="flex flex-col">
      <div className="relative flex items-start">
        {isValidSrc && !hasError ? (
          <Image
            src={src}
            alt={alt || "Imagem"}
            className={imageClasses}
            width={128}
            height={128}
            onError={handleImageError}
            {...props}
          />
        ) : (
          <div className={placeholderClasses}>
            {hasError ? (
              <FaExclamationTriangle className="w-8 h-8 text-light-danger dark:text-dark-danger" />
            ) : (
              <FaImage className="w-8 h-8 text-light-icon dark:text-dark-icon" />
            )}
          </div>
        )}
      </div>
      {(error || errorMessage) && (
        <div className="w-32 mt-1">
          <span className="text-sm text-light-text-error dark:text-dark-text-error break-words">
            {error || errorMessage}
          </span>
        </div>
      )}
    </div>
  );
}

CustomImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.string,
  onError: PropTypes.func,
};
