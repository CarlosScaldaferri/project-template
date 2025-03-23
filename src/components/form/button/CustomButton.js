import PropTypes from "prop-types";

export default function CustomButton({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const variants = {
    primary:
      "bg-light-primary dark:bg-dark-primary text-white hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark focus:ring-light-primary dark:focus:ring-dark-primary",
    secondary:
      "bg-light-secondary dark:bg-dark-secondary text-white hover:bg-light-secondary-dark dark:hover:bg-dark-secondary-dark focus:ring-light-secondary dark:focus:ring-dark-secondary",
    danger:
      "bg-light-danger dark:bg-dark-danger text-white hover:bg-light-danger-dark dark:hover:bg-dark-danger-dark focus:ring-light-danger dark:focus:ring-dark-danger",
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

CustomButton.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(["primary", "secondary", "danger"]),
};
