import Image from "next/image";
import PropTypes from "prop-types";
import clsx from "clsx";
import { FaImage } from "react-icons/fa";

const BASE_STYLES =
  "border border-system-border dark:border-dark-border bg-system-background-sidebar dark:bg-dark-background-sidebar rounded-full object-contain";

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
        {src && typeof src === "string" && src !== "" ? (
          <Image
            src={src}
            alt={alt}
            className={clsx(
              BASE_STYLES,
              error && "border-system-danger dark:border-dark-danger",
              "w-32 h-32",
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
              error && "border-system-danger dark:border-dark-danger"
            )}
          >
            <FaImage className="w-8 h-8 text-system-icon dark:text-dark-icon" />
          </div>
        )}
      </div>
      {error && (
        <div className="w-32 mt-1">
          <span className="text-sm text-system-text-error dark:text-dark-text-error break-words">
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
