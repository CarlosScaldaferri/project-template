import { useState } from "react";
import PropTypes from "prop-types";

export default function CustomInput({ label, className = "", ...props }) {
  const [hasValue, setHasValue] = useState(props.value?.trim() !== "");
  const isCheckbox = props.type === "checkbox";

  return (
    <div
      className={`w-full flex  gap-1 ${
        isCheckbox ? "flex-row items-start gap-3" : "flex-col"
      }`}
    >
      <label
        htmlFor={`input-${label}`}
        className={`
          text-base text-light-primary dark:text-dark-primary
          ${isCheckbox ? " cursor-pointer select-none order-2" : ""}
          transition-colors duration-200 ease-in-out
        `}
      >
        {label}
      </label>
      <input
        id={`input-${label}`}
        className={`
          px-4 py-2 text-base
          bg-light-background-sidebar dark:bg-dark-background-sidebar
          text-light-text dark:text-dark-text
          border border-light-border dark:border-dark-border
          rounded-md
          
          focus:border-light-primary dark:focus:border-dark-primary
          focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary
          focus:outline-none
          placeholder-light-muted dark:placeholder-dark-muted
          transition-all duration-200 ease-in-out
          disabled:bg-light-muted dark:disabled:bg-dark-muted
          disabled:cursor-not-allowed
          ${
            isCheckbox
              ? "w-5 h-5 accent-light-accent dark:accent-dark-accent cursor-pointer order-1"
              : ""
          }
          ${className}
        `}
        onChange={(e) => {
          setHasValue(e.target.value.trim() !== "");
          if (props.onChange) props.onChange(e);
        }}
        onBlur={(e) => setHasValue(e.target.value.trim() !== "")}
        {...props}
      />
    </div>
  );
}

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};
