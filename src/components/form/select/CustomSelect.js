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
        className={`peer bg-neutral-white border border-neutral-medium focus:outline-none focus:ring-2 focus:ring-focus focus:ring-primary-default box-border w-full px-3 pt-5 pb-2 rounded-md text-base text-neutral-dark ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor="select-field"
        className={`transition-all absolute left-3 bg-neutral-white ${hasValue ? "-top-2 text-sm text-neutral-dark" : "top-5 text-base text-neutral-medium"} peer-focus:-top-2 peer-focus:text-sm peer-focus:text-neutral-dark`}
      >
        {label}
      </label>
    </div>
  );
};

export default CustomSelect;
