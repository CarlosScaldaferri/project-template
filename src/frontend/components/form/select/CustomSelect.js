import PropTypes from "prop-types";
import clsx from "clsx";

const BASE_STYLES =
  "w-full px-4 py-2 text-base bg-system-background-sidebar dark:bg-dark-background-sidebar text-system-text dark:text-dark-text border border-system-border dark:border-dark-border rounded-md focus:border-system-border-focus dark:focus:border-dark-border-focus focus:ring-2 focus:ring-system-border-focus dark:focus:ring-dark-border-focus focus:outline-none transition-all duration-200 ease-in-out disabled:bg-system-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

export default function CustomSelect({
  label,
  name,
  value = "",
  onChange,
  disabled,
  options,
  className = "",
  error,
}) {
  return (
    <div className="flex flex-col">
      <label
        htmlFor={`input-${label}`}
        className="text-base text-system-text-label dark:text-dark-text-label transition-colors duration-200 ease-in-out"
      >
        {label}
      </label>
      <select
        id={`input-${label}`}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          BASE_STYLES,
          error && "border-system-danger dark:border-dark-danger",
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-sm text-system-text-error dark:text-dark-text-error mt-1">
          {error}
        </span>
      )}
    </div>
  );
}

CustomSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  className: PropTypes.string,
  error: PropTypes.string,
};
