import PropTypes from "prop-types";
import clsx from "clsx";

const BASE_STYLES =
  "px-4 py-2 text-base bg-system-background-sidebar dark:bg-dark-background-sidebar text-system-text dark:text-dark-text border border-system-border dark:border-dark-border rounded-md focus:border-system-border-focus dark:focus:border-dark-border-focus focus:ring-2 focus:ring-system-border-focus dark:focus:ring-dark-border-focus focus:outline-none placeholder-system-text-placeholder dark:placeholder-dark-text-placeholder transition-all duration-200 ease-in-out disabled:bg-system-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

const CHECKBOX_STYLES =
  "w-5 h-5 accent-system-accent dark:accent-dark-accent cursor-pointer";

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
    error && "border-system-danger dark:border-dark-danger",
    className
  );

  return (
    <div
      className={clsx(
        "w-full flex",
        isCheckbox ? "flex-row items-start" : "flex-col gap-1"
      )}
    >
      <label
        htmlFor={`input-${label}`}
        className={clsx(
          "text-base text-system-text-label dark:text-dark-text-label transition-colors duration-200 ease-in-out",
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
        <span className="text-sm text-system-text-error dark:text-dark-text-error mt-1">
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
