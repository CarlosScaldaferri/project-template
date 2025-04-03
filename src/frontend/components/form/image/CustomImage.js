import Image from "next/image";
import PropTypes from "prop-types";
import clsx from "clsx";
import { FaImage } from "react-icons/fa";

const BASE_STYLES =
  "border border-light-border dark:border-dark-border bg-light-background-sidebar dark:bg-dark-background-sidebar rounded-full object-contain";

export default function CustomImage({
  src,
  alt,
  className = "",
  error,
  ...props
}) {
  return (
    <div className="flex flex-col">
      <div className="relative flex items-start">
        {/* Container principal alinhado à esquerda */}
        {src && typeof src === "string" && src !== "" ? (
          <Image
            src={src}
            alt={alt}
            className={clsx(
              BASE_STYLES,
              error && "border-light-danger dark:border-dark-danger",
              "w-32 h-32", // Tamanho fixo
              className
            )}
            width={128}
            height={128}
            {...props}
          />
        ) : (
          <div
            className={clsx(
              BASE_STYLES,
              "w-32 h-32 flex items-center justify-center",
              error && "border-light-danger dark:border-dark-danger"
            )}
          >
            <FaImage className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      {error && (
        <div className="w-32 mt-1">
          {" "}
          {/* Container com largura fixa para a mensagem */}
          <span className="text-sm text-light-danger dark:text-dark-danger break-words">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}

CustomImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
};
