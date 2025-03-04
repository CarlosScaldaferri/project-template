import PropTypes from "prop-types";

export default function Button({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-primary-default text-neutral-white hover:bg-primary-dark focus:ring-focus-default",
    secondary:
      "bg-secondary-default text-neutral-white hover:bg-secondary-dark focus:ring-focus-default",
    danger:
      "bg-danger-default text-neutral-white hover:bg-danger-dark focus:ring-focus-default",
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
