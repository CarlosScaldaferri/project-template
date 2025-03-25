import PropTypes from "prop-types";
import clsx from "clsx"; // Biblioteca para combinar classes de forma condicional

const BASE_STYLES =
  "px-4 py-2 rounded-md focus:outline-none focus:ring-2 disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed transition-all duration-200 ease-in-out";

const VARIANTS = {
  primary: {
    bg: "bg-light-primary dark:bg-dark-primary",
    text: "text-white",
    hover: "hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark",
    focus: "focus:ring-light-primary dark:focus:ring-dark-primary",
  },
  secondary: {
    bg: "bg-light-secondary dark:bg-dark-secondary",
    text: "text-white",
    hover: "hover:bg-light-secondary-dark dark:hover:bg-dark-secondary-dark",
    focus: "focus:ring-light-secondary dark:focus:ring-dark-secondary",
  },
  danger: {
    bg: "bg-light-danger dark:bg-dark-danger",
    text: "text-white",
    hover: "hover:bg-light-danger-dark dark:hover:bg-dark-danger-dark",
    focus: "focus:ring-light-danger dark:focus:ring-dark-danger",
  },
};

export default function CustomButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const variantStyles = VARIANTS[variant] || VARIANTS.primary; // Fallback para "primary"
  const styles = clsx(
    BASE_STYLES,
    variantStyles.bg,
    variantStyles.text,
    variantStyles.hover,
    variantStyles.focus,
    className
  );

  return (
    <button {...props} className={styles}>
      {children}
    </button>
  );
}

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
};
