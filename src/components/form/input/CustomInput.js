import PropTypes from "prop-types";
import clsx from "clsx";

const BASE_STYLES =
  "px-4 py-2 text-base bg-light-background-sidebar dark:bg-dark-background-sidebar text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-md focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none placeholder-light-muted dark:placeholder-dark-muted transition-all duration-200 ease-in-out disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

const CHECKBOX_STYLES =
  "w-5 h-5 accent-light-accent dark:accent-dark-accent cursor-pointer";

export default function CustomInput({
  label,
  className = "",
  error,
  type = "text",
  value = "",
  onChange,
  ...props
}) {
  const isCheckbox = type === "checkbox";
  const inputStyles = clsx(
    BASE_STYLES,
    isCheckbox && CHECKBOX_STYLES,
    error && "border-light-danger dark:border-dark-danger",
    className
  );

  return (
    <div
      className={clsx(
        "w-full flex gap-1",
        isCheckbox ? "flex-row items-start gap-3" : "flex-col"
      )}
    >
      <label
        htmlFor={`input-${label}`}
        className={clsx(
          "text-base text-light-primary dark:text-dark-primary transition-colors duration-200 ease-in-out",
          isCheckbox && "cursor-pointer select-none order-2"
        )}
      >
        {label}
      </label>
      <input
        id={`input-${label}`}
        type={type}
        value={value}
        onChange={onChange}
        className={inputStyles}
        {...props}
      />
      {error && (
        <span className="text-sm text-light-danger dark:text-dark-danger mt-1">
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
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  onChange: PropTypes.func,
};
