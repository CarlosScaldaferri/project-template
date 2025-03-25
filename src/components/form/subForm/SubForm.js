"use client";
import { useCallback, useState } from "react";
import { useFieldArray } from "react-hook-form";
import * as Yup from "yup";
import { FaPlus, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import CustomInput from "@/components/form/input/CustomInput";
import CustomImage from "@/components/form/image/CustomImage";
import Button from "../button/CustomButton";
import CustomSelect from "../select/CustomSelect";

const SubForm = ({
  title,
  icon: Icon,
  fields,
  control,
  trigger,
  setValue,
  getValues,
  setError,
  clearErrors,
  name,
  schema,
  errors: externalErrors,
  width = "w-full",
}) => {
  const {
    fields: items,
    append,
    remove,
    update,
  } = useFieldArray({ control, name, keyName: "internalId" });
  const [isOpen, setIsOpen] = useState(false); // Controla o formulário de adição
  const [editIndex, setEditIndex] = useState(null); // Controla o índice do item sendo editado
  const [tempData, setTempData] = useState({});
  const [tempErrors, setTempErrors] = useState({});

  const resetForm = useCallback(() => {
    setIsOpen(false);
    setEditIndex(null);
    setTempData({});
    setTempErrors({});
  }, []);

  const handleAdd = useCallback(() => {
    setEditIndex(null); // Garante que não estamos editando
    const defaultValues = fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]:
          field.type === "select"
            ? field.options[0].value
            : field.type === "checkbox"
              ? false
              : "",
      }),
      { id: null, is_main: false }
    );
    setTempData(defaultValues);
    setTempErrors({});
    setIsOpen(true); // Abre o formulário de adição
  }, [fields]);

  const handleEdit = useCallback(
    (index) => {
      setEditIndex(index); // Define o índice do item a ser editado
      setIsOpen(false); // Garante que o formulário de adição não seja exibido
      const values = getValues(`${name}.${index}`);
      setTempData(values);
      setTempErrors({});
    },
    [name, getValues]
  );

  const validateField = useCallback(
    async (fieldName, value) => {
      try {
        await schema.fields[fieldName].validate(value);
        setTempErrors((prev) => ({ ...prev, [fieldName]: "" }));
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          setTempErrors((prev) => ({ ...prev, [fieldName]: err.message }));
        }
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    async (data) => {
      try {
        await schema.validate(data, { abortEarly: false });
        setTempErrors({});
        return true;
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const newErrors = {};
          err.inner.forEach((error) => {
            newErrors[error.path] = error.message;
          });
          setTempErrors(newErrors);
          return false;
        }
      }
    },
    [schema]
  );

  const handleSave = useCallback(
    async (index) => {
      const isValid = await validateForm(tempData);

      if (!isValid) {
        return;
      }

      if (index !== null) {
        update(index, tempData); // Atualiza item existente
      } else {
        append({ ...tempData }); // Adiciona novo item
      }
      resetForm();

      await trigger(name);
    },
    [name, tempData, validateForm, append, update, resetForm, trigger]
  );

  const renderForm = (index = null) => {
    const fieldPath = `${name}.${index === null ? "temp" : index}`;
    return (
      <div
        className={`w-full ${width} p-4 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border border-light-accent dark:border-dark-border ${index !== null ? "max-w-full rounded-md" : "mt-2 rounded-b-md"}`}
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4 w-full">
          {fields
            .filter((field) => !field.readOnly)
            .map((field) => {
              const fieldValue = tempData[field.name] ?? "";
              const fieldError = tempErrors[field.name] ?? "";

              const handleFieldChange = async (e) => {
                const { value, type, checked } = e.target;
                let newValue =
                  type === "checkbox"
                    ? checked
                    : field.type === "number"
                      ? value.replace(/[^0-9]/g, "")
                      : value;

                setTempData((prev) => ({ ...prev, [field.name]: newValue }));
                setValue(`${fieldPath}.${field.name}`, newValue, {
                  shouldValidate: false,
                });

                if (field.onChange) {
                  field.onChange(e, fieldPath);
                  const updatedValue = getValues(`${fieldPath}.${field.name}`);
                  if (updatedValue !== newValue) {
                    setTempData((prev) => ({
                      ...prev,
                      [field.name]: updatedValue,
                    }));
                  }
                  await validateField(field.name, updatedValue);
                } else {
                  await validateField(field.name, newValue);
                }
              };

              return field.type === "select" ? (
                <CustomSelect
                  key={field.name}
                  label={field.label}
                  name={`${fieldPath}.${field.name}`}
                  value={fieldValue}
                  onChange={handleFieldChange}
                  options={field.options}
                  error={fieldError}
                  className="w-full text-light-text dark:text-dark-text"
                />
              ) : (
                <CustomInput
                  key={field.name}
                  label={field.label}
                  name={`${fieldPath}.${field.name}`}
                  type={field.type || "text"}
                  value={fieldValue}
                  onChange={handleFieldChange}
                  error={fieldError}
                  className="w-full text-light-text dark:text-dark-text"
                  inputMode={field.type === "number" ? "numeric" : undefined}
                  pattern={field.type === "number" ? "[0-9]*" : undefined}
                />
              );
            })}
        </div>
        <div className="flex justify-start gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={resetForm}
            className="px-2 py-1 text-sm"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => handleSave(index)}
            className="px-2 py-1 text-sm"
          >
            Salvar
          </Button>
        </div>
      </div>
    );
  };

  const gridTemplateColumns = fields.length
    ? `${fields.map(() => "1fr").join(" ")} 60px 60px`
    : "grid-cols-1";

  const handleMainCheckboxChange = useCallback(
    (index) => {
      const updatedItems = items.map((item, idx) => ({
        ...item,
        is_main: idx === index ? !item.is_main : false,
      }));
      updatedItems.forEach((item, idx) => update(idx, item));
    },
    [items, update]
  );

  return (
    <section className="bg-light-background-form-primary dark:bg-dark-background-form-primary">
      <div className="flex flex-col border-b border-light-border dark:border-dark-border">
        <h2
          className={`flex items-center gap-2 ${externalErrors ? "" : "pb-4"} text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-light-primary dark:text-dark-primary" />{" "}
          {title}
        </h2>
        {externalErrors && (
          <span className="text-xs pb-4 sm:text-sm text-light-danger dark:text-dark-danger">
            {externalErrors}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className={`pt-2 w-full ${width}`}>
          <div className="hidden md:block w-full text-light-text dark:text-dark-text bg-light-background dark:bg-dark-background rounded-b-md border border-light-border dark:border-dark-border">
            <div
              className={`grid ${gridTemplateColumns} gap-x-4 border-b border-light-border dark:border-dark-border pb-2 text-xs sm:text-sm font-medium text-light-muted dark:text-dark-muted items-center bg-light-background-sidebar dark:bg-dark-background-sidebar`}
              style={{ gridTemplateColumns }}
            >
              {fields.map((field) => (
                <span key={field.name} className="truncate p-4">
                  {field.label}
                </span>
              ))}{" "}
              <span>Principal</span> <span>Ações</span>
            </div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`even:bg-light-background-form-secondary dark:even:bg-dark-background-form-secondary hover:bg-light-accent dark:hover:bg-dark-accent ${index === items.length - 1 ? "border-b-0" : "border-b border-light-border dark:border-dark-border"}`}
              >
                {editIndex !== index ? (
                  <div
                    className={`grid ${gridTemplateColumns} text-light-text dark:text-dark-text text-xs sm:text-sm items-center p-4`}
                    style={{ gridTemplateColumns }}
                  >
                    {fields.map((field) =>
                      field.type === "checkbox" ? (
                        <div key={field.name} className="flex justify-center">
                          <CustomInput
                            type="checkbox"
                            checked={item[field.name] ?? false}
                            disabled={field.readOnly || true}
                            className="justify-self-center"
                          />
                        </div>
                      ) : field.type === "file" ? (
                        <CustomImage
                          key={field.name}
                          src={item[field.name]}
                          alt={field.label}
                          className="w-12 h-12 object-cover border-none rounded-md"
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
                        onChange={() => handleMainCheckboxChange(index)}
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
                        onClick={() => remove(index)}
                        className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ) : (
                  renderForm(index) // Renderiza o formulário de edição dentro da grid
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renderiza o formulário de adição fora da grid apenas se isOpen for true e editIndex for null */}
      {isOpen && editIndex === null && renderForm(null)}

      {/* Botão de adicionar aparece apenas se nenhum formulário estiver aberto */}
      {!isOpen && editIndex === null && (
        <button
          type="button"
          onClick={handleAdd}
          className="pt-2 flex items-center gap-1 py-1 text-xs sm:text-sm text-light-primary dark:text-dark-primary hover:text-light-primary-dark dark:hover:text-dark-primary-dark"
        >
          <FaPlus /> Adicionar {title}
        </button>
      )}
    </section>
  );
};

export default SubForm;
