import { useState } from "react";
import PropTypes from "prop-types";

export default function CustomInput({ label, className = "", ...props }) {
  const [hasValue, setHasValue] = useState(props.value?.trim() !== "");
  const isCheckbox = props.type === "checkbox";

  return (
    <div
      className={`relative w-full ${isCheckbox ? "flex items-center justify-end gap-2" : ""}`}
    >
      <input
        id="input-field"
        className={`peer border border-neutral-light focus:outline-none focus:ring-2 focus:ring-focus box-border ${isCheckbox ? "w-5 h-5" : "w-full px-3 pt-5 pb-2 rounded-md text-base text-neutral-dark"} ${className}`}
        placeholder={isCheckbox ? undefined : " "}
        onChange={(e) => {
          setHasValue(e.target.value.trim() !== "");
          if (props.onChange) props.onChange(e);
        }}
        onBlur={(e) => setHasValue(e.target.value.trim() !== "")}
        {...props}
      />
      <label
        htmlFor="input-field"
        className={`transition-all ${isCheckbox ? "text-base text-neutral-dark" : "absolute left-3 bg-neutral-white"} ${hasValue ? "-top-2 text-sm text-neutral-dark" : "top-5 text-base text-neutral-medium"} peer-focus:-top-2 peer-focus:text-sm peer-focus:text-neutral-dark`}
      >
        {label}
      </label>
    </div>
  );
}

CustomInput.propTypes = {
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};
