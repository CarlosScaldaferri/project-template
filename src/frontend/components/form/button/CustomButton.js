import PropTypes from "prop-types";
import clsx from "clsx";
import { ClipLoader } from "react-spinners";

const BASE_STYLES =
  "px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:bg-system-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed transition-all duration-200 ease-in-out flex items-center justify-center gap-2";

const VARIANTS = {
  primary: {
    bg: "bg-system-primary dark:bg-dark-primary",
    text: "text-system-text-button dark:text-dark-text-button",
    hover: "hover:bg-system-primary-dark dark:hover:bg-dark-primary-dark",
    focus: "focus:ring-system-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
  secondary: {
    bg: "bg-system-secondary dark:bg-dark-secondary",
    text: "text-system-text-button dark:text-dark-text-button",
    hover: "hover:bg-system-secondary-dark dark:hover:bg-dark-secondary-dark",
    focus: "focus:ring-system-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
  danger: {
    bg: "bg-system-danger dark:bg-dark-danger",
    text: "text-system-text-button dark:text-dark-text-button",
    hover: "hover:bg-system-danger-dark dark:hover:bg-dark-danger-dark",
    focus: "focus:ring-system-border-focus dark:focus:ring-dark-border-focus",
    loadingColor: "#FFFFFF",
  },
};

export default function CustomButton({
  children,
  className = "",
  variant = "primary",
  isLoading = false,
  loadingText = "",
  ...props
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary;

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

  return (
    <button
      {...props}
      className={styles}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <>
          <ClipLoader
            size={18}
            color={variantStyles.loadingColor}
            className="mr-2"
          />
          {loadingText || children}
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
};
