"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import CustomInput from "@/components/form/input/CustomInput";
import CustomImage from "@/components/form/image/CustomImage";
import * as Yup from "yup";
import Button from "../button/CustomButton";
import CustomSelect from "../select/CustomSelect";

const SubForm = ({
  title,
  icon: Icon,
  fields,
  initialData,
  schema,
  onSave,
  errors: externalErrors,
  width = "w-full",
  fetchAddressByCep,
}) => {
  const [items, setItems] = useState(initialData || []);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(
    fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]:
          field.type === "select"
            ? field.options[0].value
            : field.type === "checkbox"
              ? false // Padrão para checkbox
              : field.type === "number"
                ? ""
                : "",
      }),
      {
        id: null,
        is_main: false,
      }
    )
  );
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const rowRefs = useRef([]);

  const validateField = useCallback(
    async (fieldName, value, fullData) => {
      try {
        const dataToValidate = fullData || { [fieldName]: value };
        await schema.validateAt(fieldName, dataToValidate);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
        }
      }
    },
    [schema]
  );

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked, files } = e.target;
      let newValue;

      const field = fields.find((f) => f.name === name);
      if (field?.type === "number") {
        const numericValue = value.replace(/[^0-9]/g, "");
        newValue = numericValue;
      } else if (field?.type === "checkbox") {
        newValue = checked; // Sempre booleano para checkbox
      } else {
        newValue = type === "checkbox" ? checked : value;
      }

      if (type === "file" && files && files[0]) {
        newValue = URL.createObjectURL(files[0]);
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));
      validateField(name, newValue, { ...formData, [name]: newValue });

      if (field?.onChange) {
        field.onChange(e, setFormData, validateField, formData.type);
      }

      if (field?.name === "zip_code" && fetchAddressByCep) {
        fetchAddressByCep(newValue, setFormData, setErrors);
      }
    },
    [validateField, formData, fields, fetchAddressByCep]
  );

  const resetFormForNewEntry = useCallback(() => {
    setFormData(
      fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]:
            field.type === "select"
              ? field.options[0].value
              : field.type === "checkbox"
                ? false // Padrão para checkbox
                : field.type === "number"
                  ? ""
                  : "",
        }),
        {
          id: null,
          is_main: false,
        }
      )
    );
    setErrors({});
    setEditIndex(null);
    setIsOpen(true);
  }, [fields]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const adjustedFormData = { ...formData };
        fields.forEach((field) => {
          if (field.type === "number" && adjustedFormData[field.name]) {
            adjustedFormData[field.name] = Number(adjustedFormData[field.name]);
          }
        });

        await schema.validate(adjustedFormData, { abortEarly: false });
        setErrors({});

        if (editIndex !== null) {
          const updatedItems = items.map((item, i) =>
            i === editIndex ? { ...adjustedFormData } : item
          );
          setItems(updatedItems);
          onSave(updatedItems);
        } else {
          const newItem = { ...adjustedFormData };
          setItems((prev) => [...prev, newItem]);
          onSave([...items, newItem]);
        }
        resetFormForNewEntry();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errorMap = {};
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message;
          });
          setErrors(errorMap);
          console.log("Validation errors:", errorMap);
        }
      }
    },
    [formData, schema, items, editIndex, onSave, resetFormForNewEntry, fields]
  );

  const handleEdit = useCallback(
    (index) => {
      const item = { ...items[index] };
      fields.forEach((field) => {
        if (
          field.type === "checkbox" &&
          (item[field.name] == null || item[field.name] === "")
        ) {
          item[field.name] = false; // Garante false para checkbox indefinido
        } else if (field.type === "number" && item[field.name] !== undefined) {
          item[field.name] = String(item[field.name]);
        }
      });
      setEditIndex(index);
      setFormData(item);
      setIsOpen(true);
    },
    [items, fields]
  );

  const handleRemove = useCallback(
    (index) => {
      const updatedItems = items.filter((_, i) => i !== index);
      setItems(updatedItems);
      onSave(updatedItems);
    },
    [items, onSave]
  );

  const handleMainToggle = useCallback(
    (index) => {
      const updatedItems = items.map((item, i) => ({
        ...item,
        is_main: i === index ? !item.is_main : false,
      }));
      setItems(updatedItems);
      onSave(updatedItems);
    },
    [items, onSave]
  );

  const resetForm = useCallback(() => {
    setFormData(
      fields.reduce(
        (acc, field) => ({
          ...acc,
          [field.name]:
            field.type === "select"
              ? field.options[0].value
              : field.type === "checkbox"
                ? false // Padrão para checkbox
                : field.type === "number"
                  ? ""
                  : "",
        }),
        {
          id: null,
          is_main: false,
        }
      )
    );
    setErrors({});
    setIsOpen(false);
    setEditIndex(null);
  }, [fields]);

  const renderForm = () => (
    <div
      className={`w-full ${width} p-4 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border border-light-accent dark:border-dark-border ${
        editIndex !== null ? "max-w-full rounded-md" : "mt-2 rounded-b-md"
      }`}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4 w-full">
        {fields
          .filter((field) => !field.readOnly)
          .map((field, index) => (
            <div key={index} className="flex flex-col w-full">
              {field.type === "select" ? (
                <CustomSelect
                  label={field.label}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={field.onChange || handleChange}
                  options={field.options}
                  error={errors[field.name]}
                  className="w-full text-light-text dark:text-dark-text"
                />
              ) : (
                <CustomInput
                  label={field.label}
                  name={field.name}
                  type={field.type || "text"}
                  value={formData[field.name]}
                  onChange={
                    field.onChange
                      ? (e) =>
                          field.onChange(
                            e,
                            setFormData,
                            validateField,
                            formData.type
                          )
                      : handleChange
                  }
                  error={errors[field.name]}
                  className="w-full text-light-text dark:text-dark-text"
                />
              )}
            </div>
          ))}
      </div>

      <div className="flex justify-start gap-2 sm:gap-3 mt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={resetForm}
          className="px-2 py-1 text-sm text-light-text dark:text-dark-text bg-light-background-form-primary dark:bg-dark-background-form-primary hover:bg-light-accent dark:hover:bg-dark-accent rounded-md w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          onClick={handleSave}
          className="px-2 py-1 text-sm text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark rounded-md w-auto"
        >
          Salvar
        </Button>
      </div>
    </div>
  );

  const calcularLarguraColunas = (fields) => {
    if (!fields || fields.length === 0) return "grid-cols-1";
    const numColumns = fields.length + 2;
    const colunas = Array(numColumns)
      .fill()
      .map((_, index) => {
        if (index === numColumns - 2) return "60px";
        else if (index === numColumns - 1) return "60px";
        return "1fr";
      });
    return colunas.join(" ");
  };

  const gridTemplateColumns = calcularLarguraColunas(fields);

  useEffect(() => {
    setItems(initialData || []);
  }, [initialData]);

  return (
    <section
      className={`bg-light-background-form-primary dark:bg-dark-background-form-primary`}
    >
      <div className="flex flex-col border-b border-light-border dark:border-dark-border">
        <h2
          className={`flex items-center gap-2 ${externalErrors ? "" : "pb-4"} text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-light-primary dark:text-dark-primary" />
          {title}
        </h2>
        {externalErrors && (
          <span className="text-xs pb-4 sm:text-sm text-light-danger dark:text-dark-danger">
            {externalErrors}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div
          className={`pt-2 w-full ${width} bg-light-background-form-primary dark:bg-dark-background-form-primary`}
        >
          {/* Desktop Grid */}
          <div className="hidden md:block w-full h-full overflow-hidden text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background rounded-b-md bg-clip-border border border-light-border dark:border-dark-border">
            <div
              className={`grid ${gridTemplateColumns} gap-x-4 border-b border-light-border dark:border-dark-border pb-2 text-xs sm:text-sm font-medium text-light-muted dark:text-dark-muted items-center bg-light-background-sidebar dark:bg-dark-background-sidebar`}
              style={{ gridTemplateColumns: gridTemplateColumns }}
            >
              {fields.map((field, index) => (
                <span key={index} className="truncate p-4">
                  {field.label}
                </span>
              ))}
              <span className="truncate w-fit">Principal</span>
              <span className="truncate w-fit">Ações</span>
            </div>
            {items.map((item, index) => (
              <div
                key={index}
                className={`even:bg-light-background-form-secondary dark:even:bg-dark-background-form-secondary hover:bg-light-accent dark:hover:bg-dark-accent ${index === items.length - 1 ? "border-b-0" : "border-b border-light-border dark:border-dark-border"}`}
              >
                {editIndex !== index ? (
                  <div
                    ref={(el) => (rowRefs.current[index] = el)}
                    className={`grid ${gridTemplateColumns} text-light-text dark:text-dark-text text-xs sm:text-sm items-center justify-start p-4`}
                    style={{ gridTemplateColumns: gridTemplateColumns }}
                  >
                    {fields.map((field, index) =>
                      field.type === "checkbox" ? (
                        <div key={index} className="flex justify-center">
                          <CustomInput
                            type="checkbox"
                            checked={item[field.name] ?? false} // Garante false para null/undefined
                            disabled={field.readOnly || true}
                            className="justify-self-center"
                          />
                        </div>
                      ) : field.type === "file" ? (
                        <CustomImage
                          key={index}
                          src={item[field.name]}
                          alt={field.label}
                          className="w-12 h-12 object-cover border-none rounded-md"
                        />
                      ) : (
                        <span key={index} className="truncate">
                          {item[field.name] || "-"}
                        </span>
                      )
                    )}
                    <div className="flex justify-center">
                      <CustomInput
                        type="checkbox"
                        checked={item.is_main || false}
                        onChange={() => handleMainToggle(index)}
                        className="justify-self-center"
                      />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="text-light-primary dark:text-dark-primary hover:text-light-primary-dark dark:hover:text-dark-primary-dark"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ) : (
                  renderForm()
                )}
              </div>
            ))}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden w-full space-y-2 mb-2">
            {items.map((item, index) => (
              <div key={index}>
                {editIndex !== index ? (
                  <div
                    key={index}
                    className="p-2 bg-light-background-form-primary dark:bg-dark-background-form-primary border border-light-border dark:border-dark-border rounded-md"
                  >
                    <div className="space-y-2 text-sm text-light-text dark:text-dark-text">
                      {fields.map((field, index) =>
                        field.type === "checkbox" ? (
                          <div key={index} className="relative w-full">
                            <span className="truncate w-fit text-light-muted dark:text-dark-muted">
                              {field.label}:
                            </span>
                            <CustomInput
                              type="checkbox"
                              checked={item[field.name] ?? false} // Garante false para null/undefined
                              disabled={field.readOnly || true}
                              className="absolute right-0 top-1/2 transform -translate-y-1/2"
                            />
                          </div>
                        ) : field.type === "file" ? (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium text-light-muted dark:text-dark-muted">
                              {field.label}:
                            </span>
                            <CustomImage
                              src={item[field.name]}
                              alt={field.label}
                              className="w-12 h-12 object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            key={index}
                            className="flex justify-between items-center"
                          >
                            <span className="font-medium text-light-muted dark:text-dark-muted">
                              {field.label}:
                            </span>
                            <span>{item[field.name] || "-"}</span>
                          </div>
                        )
                      )}
                      <div className="relative w-full">
                        <span className="truncate w-fit text-light-muted dark:text-dark-muted">
                          Principal:
                        </span>
                        <CustomInput
                          type="checkbox"
                          checked={item.is_main || false}
                          onChange={() => handleMainToggle(index)}
                          className="absolute right-0 top-1/2 transform -translate-y-1/2"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-8">
                      <button
                        type="button"
                        onClick={() => handleEdit(index)}
                        className="text-light-primary dark:text-dark-primary hover:text-light-primary-dark dark:hover:text-dark-primary-dark"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div key={index} className="mt-2">
                    {renderForm()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && editIndex === null && renderForm()}

      {!isOpen && editIndex === null && (
        <button
          type="button"
          onClick={() => {
            setEditIndex(null);
            setFormData(
              fields.reduce(
                (acc, field) => ({
                  ...acc,
                  [field.name]:
                    field.type === "select"
                      ? field.options[0].value
                      : field.type === "checkbox"
                        ? false // Padrão para checkbox
                        : field.type === "number"
                          ? ""
                          : "",
                }),
                {
                  id: null,
                  is_main: false,
                }
              )
            );
            setIsOpen(true);
          }}
          className="pt-2 flex items-center gap-1 py-1 text-xs sm:text-sm text-light-primary dark:text-dark-primary hover:text-light-primary-dark dark:hover:text-dark-primary-dark"
        >
          <FaPlus /> Adicionar {title}
        </button>
      )}
    </section>
  );
};

export default SubForm;
