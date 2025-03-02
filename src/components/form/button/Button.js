import PropTypes from "prop-types";

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-accent text-neutral-white hover:bg-accent-dark focus:ring-focus",
    secondary:
      "bg-secondary text-neutral-white hover:bg-secondary-dark focus:ring-focus",
    danger:
      "bg-danger text-neutral-white hover:bg-danger-dark focus:ring-focus",
  };

  return (
    <button
      {...props}
      className={`${variants[variant]} px-4 py-2 rounded-md focus:outline-none focus:ring-2 ${className}`}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
};
