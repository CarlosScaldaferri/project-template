import React, { useState } from "react";
import PropTypes from "prop-types";

export default function Form({ onSubmit, children, className }) {
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {};
    const newErrors = {};

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.name) {
        formData[child.props.name] = child.props.value || "";
        if (child.props.required && !formData[child.props.name]) {
          newErrors[child.props.name] = `${child.props.label} é obrigatório.`;
        }
      }
    });

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
      setErrors({});
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col gap-4 ${className}`}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.props.name) {
          return React.cloneElement(child, { error: errors[child.props.name] });
        }
        return child;
      })}
    </form>
  );
}

Form.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
