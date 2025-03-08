import { useState } from "react";

const CustomSelect = ({
  label,
  name,
  value,
  onChange,
  disabled,
  options,
  className = "",
}) => {
  const [hasValue, setHasValue] = useState(value?.trim() !== "");

  return (
    <div className="relative">
      <label
        htmlFor={`input-${label}`}
        className={`text-base text-light-primary dark:text-dark-primary 
          ${hasValue && "text-light-primary dark:text-dark-primary"}
          transition-colors duration-200 ease-in-out`}
      >
        {label}
      </label>
      <select
        id="select-field"
        name={name}
        value={value}
        onChange={(e) => {
          setHasValue(e.target.value.trim() !== "");
          onChange(e);
        }}
        onBlur={(e) => setHasValue(e.target.value.trim() !== "")}
        disabled={disabled}
        className={`
          w-full px-4 py-2 text-base
          bg-light-background-sidebar dark:bg-dark-background-sidebar
          text-light-text dark:text-dark-text
          border border-light-border dark:border-dark-border
          rounded-md
          focus:border-light-primary dark:focus:border-dark-primary
          focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary
          focus:outline-none
          transition-all duration-200 ease-in-out
          disabled:bg-light-muted dark:disabled:bg-dark-muted
          disabled:cursor-not-allowed
          ${className}
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CustomSelect;
