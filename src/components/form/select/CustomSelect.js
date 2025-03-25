import PropTypes from "prop-types";
import clsx from "clsx";

const BASE_STYLES =
  "w-full px-4 py-2 text-base bg-light-background-sidebar dark:bg-dark-background-sidebar text-light-text dark:text-dark-text border border-light-border dark:border-dark-border rounded-md focus:border-light-primary dark:focus:border-dark-primary focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:outline-none transition-all duration-200 ease-in-out disabled:bg-light-muted dark:disabled:bg-dark-muted disabled:cursor-not-allowed";

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
        className="text-base text-light-primary dark:text-dark-primary transition-colors duration-200 ease-in-out"
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
          error && "border-light-danger dark:border-dark-danger",
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
        <span className="text-sm text-light-danger dark:text-dark-danger mt-1">
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
