"use client";

import { useState, useCallback, useRef } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import CustomInput from "@/components/form/input/CustomInput";
import CustomImage from "@/components/form/image/CustomImage";
import * as Yup from "yup";
import Button from "../button/Button";

const SubForm = ({
  title,
  icon: Icon,
  fields,
  initialData,
  schema,
  onSave,
  errors: externalErrors,
  fetchAddressByCep,
  width = "w-full",
}) => {
  const [items, setItems] = useState(initialData || []);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {
      id: Date.now(),
      is_main: false,
    })
  );
  const [errors, setErrors] = useState({});
  const [editIndex, setEditIndex] = useState(null);
  const rowRefs = useRef([]);

  const validateField = useCallback(
    async (fieldName, value) => {
      try {
        await schema.validateAt(fieldName, { [fieldName]: value });
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
      let newValue = type === "checkbox" ? checked : value;

      if (type === "file" && files && files[0]) {
        newValue = URL.createObjectURL(files[0]);
      }

      setFormData((prev) => ({ ...prev, [name]: newValue }));

      // Valida apenas se não for um campo de arquivo
      if (type !== "file") {
        validateField(name, newValue);
      }

      if (name === "zip_code" && fetchAddressByCep) {
        fetchAddressByCep(newValue, setFormData, setErrors);
      }
    },
    [validateField, fetchAddressByCep]
  );

  const resetFormForNewEntry = useCallback(() => {
    setFormData(
      fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {
        id: Date.now(),
        is_main: false,
      })
    );
    setErrors({});
    setEditIndex(null);
    setIsOpen(true);
  }, [fields]);

  const handleSave = useCallback(
    async (e) => {
      e.preventDefault(); // Impede propagação para o UserForm
      try {
        await schema.validate(formData, { abortEarly: false });
        setErrors({});
        if (editIndex !== null) {
          const updatedItems = items.map((item, i) =>
            i === editIndex ? { ...formData } : item
          );
          setItems(updatedItems);
          onSave(updatedItems);
        } else {
          setItems((prev) => [...prev, formData]);
          onSave([...items, formData]);
        }
        resetFormForNewEntry();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errorMap = {};
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message;
          });
          setErrors(errorMap);
          console.log("Erros de validação no SubForm:", errorMap); // Adicione isso para depuração
        }
      }
    },
    [formData, schema, items, editIndex, onSave, resetFormForNewEntry]
  );

  // No renderForm:
  <Button
    type="button"
    variant="primary"
    onClick={handleSave}
    className="px-2 py-1 text-sm text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark rounded-md w-full sm:w-auto"
  >
    Salvar
  </Button>;

  const handleEdit = useCallback(
    (index) => {
      setEditIndex(index);
      setFormData({ ...items[index] });
      setIsOpen(true);
    },
    [items]
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
      fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {
        id: Date.now(),
        is_main: false,
      })
    );
    setErrors({});
    setIsOpen(false);
    setEditIndex(null);
  }, [fields]);

  const renderForm = () => (
    <div
      className={`w-full ${width} p-4 mt-1 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border-2 border-light-primary dark:border-dark-primary rounded-md ${
        editIndex !== null ? "max-w-full" : ""
      }`}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4 w-full">
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col w-full">
            {field.type === "file" ? (
              <div className="flex flex-col w-full">
                <label className="text-sm text-light-text dark:text-dark-text mb-1">
                  {field.label}
                </label>
                <div className="relative w-full">
                  <input
                    type="file"
                    name={field.name}
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                    id={`file-input-${field.name}`}
                  />
                  <Button
                    type="button"
                    className="cursor-pointer px-8 py-1 text-sm text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark rounded-md w-auto"
                  >
                    <label
                      htmlFor={`file-input-${field.name}`}
                      className="whitespace-nowrap cursor-pointer"
                    >
                      Escolher Arquivo
                    </label>
                  </Button>
                  {formData[field.name] && (
                    <CustomImage
                      src={formData[field.name]}
                      alt="Pré-visualização"
                      className="col-span-1 mt-2 w-[10.5rem] h-[10.5rem]"
                    />
                  )}
                </div>
              </div>
            ) : (
              <CustomInput
                label={field.label}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
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
        if (index === numColumns - 2)
          return "40px"; // Coluna "Principal"
        else if (index === numColumns - 1) return "80px"; // Coluna "Ações"
        return "1fr"; // Outras colunas
      });
    return colunas.join(" ");
  };

  const gridTemplateColumns = calcularLarguraColunas(fields);

  return (
    <section
      className={`bg-light-background-form-primary dark:bg-dark-background-form-primary`}
    >
      <div className="flex flex-col border-b border-light-border dark:border-dark-border">
        <h2 className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-light-primary dark:text-dark-primary" />
          {title}
        </h2>
        {externalErrors && (
          <span className="text-xs sm:text-sm text-light-danger dark:text-dark-danger">
            {externalErrors}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div
          className={`pt-2 w-full ${width} bg-light-background-form-primary dark:bg-dark-background-form-primary`}
        >
          {/* Desktop Grid */}
          <div className="hidden md:block overflow-x-auto p-2 border border-light-border dark:border-dark-border rounded-md">
            <div
              className={`grid ${gridTemplateColumns} gap-x-4 border-b border-light-border dark:border-dark-border pb-2 text-xs sm:text-sm font-medium text-light-muted dark:text-dark-muted items-center`}
              style={{ gridTemplateColumns: gridTemplateColumns }}
            >
              {fields.map((field) => (
                <span key={field.name} className="truncate">
                  {field.label}
                </span>
              ))}
              <span className="text-center">Principal</span>
              <span className="text-center">Ações</span>
            </div>
            {items.map((item, index) => (
              <div key={item.id}>
                {editIndex !== index ? (
                  <div
                    ref={(el) => (rowRefs.current[index] = el)}
                    className={`grid ${gridTemplateColumns} py-2 text-light-text dark:text-dark-text text-xs sm:text-sm items-center`}
                    style={{ gridTemplateColumns: gridTemplateColumns }}
                  >
                    {fields.map((field) =>
                      field.type === "file" ? (
                        <CustomImage
                          key={field.name}
                          src={item[field.name]}
                          alt={field.label}
                          className="w-12 h-12 object-cover border-none"
                        />
                      ) : (
                        <span key={field.name} className="truncate">
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
              <div key={item.id}>
                {editIndex !== index ? (
                  <div className="p-2 bg-light-background-form-primary dark:bg-dark-background-form-primary border border-light-border dark:border-dark-border rounded-md">
                    <div className="space-y-2 text-sm text-light-text dark:text-dark-text">
                      {fields.map((field) =>
                        field.type === "file" ? (
                          <div
                            key={field.name}
                            className="flex justify-between"
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
                            key={field.name}
                            className="flex justify-between"
                          >
                            <span className="font-medium text-light-muted dark:text-dark-muted">
                              {field.label}:
                            </span>
                            <span>{item[field.name] || "-"}</span>
                          </div>
                        )
                      )}
                      <div className="relative w-full">
                        <span className="font-medium text-light-muted dark:text-dark-muted absolute left-0">
                          Principal:
                        </span>
                        <CustomInput
                          type="checkbox"
                          label=""
                          checked={item.is_main || false}
                          onChange={() => handleMainToggle(index)}
                          className="bg-light-primary-dark absolute right-0"
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
                  <div className="mt-2">{renderForm()}</div>
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
              fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {
                id: Date.now(),
                is_main: false,
              })
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
