"use client";
import { useCallback, useState } from "react";
import { useFieldArray } from "react-hook-form";
import * as Yup from "yup";
import { FaPlus, FaEdit } from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import CustomInput from "../input/CustomInput";
import CustomButton from "../button/CustomButton";
import CustomSelect from "../select/CustomSelect";
import CustomImage from "../image/CustomImage";

const SubForm = ({
  title,
  icon: Icon,
  fields,
  control,
  trigger,
  setValue,
  getValues,
  name,
  schema,
  errors: externalErrors,
  width = "w-full",
  setError,
  clearErrors,
  isSubmitting,
}) => {
  const {
    fields: items,
    append,
    remove,
    update,
  } = useFieldArray({ control, name, keyName: "internalId" });
  const [isOpen, setIsOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [tempData, setTempData] = useState({});
  const [tempErrors, setTempErrors] = useState({});

  const resetForm = useCallback(() => {
    setIsOpen(false);
    setEditIndex(null);
    setTempData({});
    setTempErrors({});
  }, []);

  const handleAdd = useCallback(() => {
    setEditIndex(null);
    const defaultValues = fields.reduce(
      (acc, field) => ({
        ...acc,
        [field.name]:
          field.type === "select"
            ? field.options[0].value
            : field.type === "date"
              ? null
              : field.type === "checkbox"
                ? false
                : "",
      }),
      { id: null, is_main: false }
    );
    setTempData(defaultValues);
    setTempErrors({});
    setIsOpen(true);
  }, [fields]);

  const handleEdit = useCallback(
    (index) => {
      setEditIndex(index);
      setIsOpen(false);
      const values = getValues(`${name}.${index}`);
      setTempData(values);
      setTempErrors({});
    },
    [name, getValues]
  );

  /**
   * Valida um campo específico do formulário
   * @param {string} fieldName - Nome do campo a ser validado
   * @param {any} value - Valor do campo
   * @returns {Promise<boolean>} true se o campo é válido, false caso contrário
   */
  const validateField = useCallback(
    async (fieldName, value) => {
      try {
        // Verifica se o campo existe no schema
        if (!schema.fields[fieldName]) {
          console.warn(`Campo ${fieldName} não encontrado no schema`);
          return true;
        }

        // Valida o campo
        await schema.fields[fieldName].validate(value);

        // Limpa o erro do campo
        setTempErrors((prev) => ({ ...prev, [fieldName]: "" }));
        return true;
      } catch (err) {
        // Trata o erro de validação
        if (err instanceof Yup.ValidationError) {
          const errorMessage = err.message || `Campo ${fieldName} inválido`;
          console.debug(
            `Erro de validação no campo ${fieldName}:`,
            errorMessage
          );

          // Define o erro do campo
          setTempErrors((prev) => ({ ...prev, [fieldName]: errorMessage }));
          return false;
        }

        // Trata outros tipos de erro
        console.error(`Erro inesperado ao validar campo ${fieldName}:`, err);
        setTempErrors((prev) => ({
          ...prev,
          [fieldName]: "Erro inesperado na validação",
        }));
        return false;
      }
    },
    [schema]
  );

  /**
   * Valida o formulário completo
   * @param {Object} data - Dados do formulário
   * @returns {Promise<boolean>} true se o formulário é válido, false caso contrário
   */
  const validateForm = useCallback(
    async (data) => {
      try {
        // Valida todos os campos de uma vez
        await schema.validate(data, { abortEarly: false });

        // Limpa todos os erros
        setTempErrors({});
        return true;
      } catch (err) {
        // Trata o erro de validação
        if (err instanceof Yup.ValidationError) {
          console.debug("Erros de validação no formulário:", err.inner);

          // Mapeia os erros para cada campo
          const newErrors = {};
          err.inner.forEach((error) => {
            newErrors[error.path] = error.message;
          });

          // Define os erros dos campos
          setTempErrors(newErrors);
          return false;
        }

        // Trata outros tipos de erro
        console.error("Erro inesperado ao validar formulário:", err);
        setTempErrors({ form: "Erro inesperado na validação do formulário" });
        return false;
      }
    },
    [schema]
  );

  /**
   * Salva os dados do formulário
   * @param {number|null} index - Índice do item a ser atualizado, ou null para criar um novo
   * @returns {Promise<void>}
   */
  const handleSave = useCallback(
    async (index) => {
      try {
        // Valida o formulário
        const isValid = await validateForm(tempData);

        if (!isValid) {
          // Se o formulário não for válido, mostra o primeiro erro
          const firstErrorKey = Object.keys(tempErrors)[0];
          if (firstErrorKey && tempErrors[firstErrorKey]) {
            console.debug(`Erro ao salvar: ${tempErrors[firstErrorKey]}`);
          }
          return;
        }

        // Atualiza ou cria um novo item
        if (index !== null) {
          update(index, tempData);
        } else {
          append({ ...tempData });
        }

        // Limpa o formulário
        resetForm();

        // Dispara a validação do formulário principal
        await trigger(name);
      } catch (error) {
        // Trata erros inesperados
        console.error("Erro ao salvar item:", error);
        setTempErrors({
          form: "Erro inesperado ao salvar. Tente novamente.",
        });
      }
    },
    [
      name,
      tempData,
      tempErrors,
      validateForm,
      append,
      update,
      resetForm,
      trigger,
    ]
  );

  const renderForm = (index = null) => {
    const fieldPath = `${name}.${index === null ? "temp" : index}`;
    return (
      <div
        className={`w-full ${width} p-4 border border-light-border dark:border-dark-border`}
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

              if (field.type === "date") {
                return (
                  <CustomInput
                    key={field.name}
                    label={field.label}
                    name={`${fieldPath}.${field.name}`}
                    type="date"
                    value={fieldValue ? fieldValue.substring(0, 10) : ""}
                    onChange={handleFieldChange}
                    error={fieldError}
                    className="w-full text-light-text dark:text-dark-text"
                  />
                );
              }

              if (field.type === "select") {
                return (
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
                );
              }

              return (
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
          <CustomButton
            type="button"
            variant="secondary"
            onClick={resetForm}
            className="px-2 py-1 text-sm"
          >
            Cancelar
          </CustomButton>
          <CustomButton
            type="button"
            variant="primary"
            onClick={() => handleSave(index)}
            className="px-2 py-1 text-sm"
          >
            Salvar
          </CustomButton>
        </div>
      </div>
    );
  };

  const gridTemplateColumns = fields.length
    ? `${fields.map(() => "1fr").join(" ")} 60px 60px`
    : "grid-cols-1";

  /**
   * Altera o estado de "principal" de um item
   * @param {number} index - Índice do item a ser alterado
   * @returns {void}
   */
  const handleMainCheckboxChange = useCallback(
    (index) => {
      try {
        // Verifica se o índice é válido
        if (index < 0 || index >= items.length) {
          console.error(`Índice inválido: ${index}`);
          return;
        }

        // Atualiza o estado de "principal" de todos os itens
        // Apenas o item selecionado será marcado como principal
        const updatedItems = items.map((item, idx) => ({
          ...item,
          is_main: idx === index ? !item.is_main : false,
        }));

        // Atualiza cada item individualmente
        updatedItems.forEach((item, idx) => update(idx, item));

        // Dispara a validação do formulário principal
        trigger(name);
      } catch (error) {
        // Trata erros inesperados
        console.error("Erro ao alterar item principal:", error);
      }
    },
    [items, update, trigger, name]
  );

  return (
    <section id={`subform-${name}`}>
      <div className="flex flex-col border-b border-light-border dark:border-dark-border">
        <h2
          className={`flex items-center gap-2 ${externalErrors ? "" : "pb-4"} text-lg sm:text-xl text-light-text dark:text-dark-text`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-light-primary dark:text-dark-primary" />
          {title}
        </h2>
        {externalErrors &&
          typeof externalErrors === "object" &&
          !Array.isArray(externalErrors) &&
          externalErrors.message && (
            <span className="text-xs pb-4 sm:text-sm text-light-text-error dark:text-dark-text-error">
              {/* Renderize APENAS a mensagem */}
              {externalErrors.message}
            </span>
          )}
      </div>

      {items.length > 0 && (
        <div className={`pt-2 w-full ${width}`}>
          {/* Desktop grid */}
          <div className="hidden md:block w-full text-light-text-table dark:text-dark-text-table bg-light-background-table dark:bg-dark-background-table border border-light-border dark:border-dark-border">
            <div
              className={`grid ${gridTemplateColumns} gap-x-4 border-b border-light-border-table-header dark:border-dark-border-table-header pb-2 text-xs sm:text-sm font-medium text-light-text-table-header dark:text-dark-text-table-header items-center bg-light-background-table-header dark:bg-dark-background-table-header`}
              style={{ gridTemplateColumns }}
            >
              {fields.map((field) => (
                <span key={field.name} className="truncate p-4">
                  {field.label}
                </span>
              ))}
              <span>Principal</span>
              <span>Ações</span>
            </div>
            {items.map((item, index) => (
              <div
                key={item.internalId}
                className={`even:bg-light-background-form-secondary dark:even:bg-dark-background-form-secondary hover:bg-light-accent dark:hover:bg-dark-accent ${index === items.length - 1 ? "border-b-0" : "border-b border-light-border dark:border-dark-border"}`}
              >
                {editIndex !== index ? (
                  <div
                    className={`grid ${gridTemplateColumns} text-light-text-table dark:text-dark-text-table text-xs sm:text-sm items-center p-4`}
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
                          {field.type === "date" && item[field.name]
                            ? new Date(item[field.name]).toLocaleDateString()
                            : item[field.name] || "-"}
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
                  renderForm(index)
                )}
              </div>
            ))}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden w-full text-light-text-table dark:text-dark-text-table">
            {items.map((item, index) => (
              <div
                key={item.internalId}
                className={`p-4 mb-2 bg-light-background-card dark:bg-dark-background-card rounded-md border border-light-border dark:border-dark-border ${editIndex === index ? "bg-light-background-form-secondary dark:bg-dark-background-form-secondary" : ""}`}
              >
                {editIndex !== index ? (
                  <div>
                    {fields.map((field) => (
                      <div
                        key={field.name}
                        className="mb-2 flex justify-between items-center"
                      >
                        <span className="font-medium text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                          {field.label}:
                        </span>
                        <div className="flex items-center">
                          {field.type === "checkbox" ? (
                            <CustomInput
                              type="checkbox"
                              checked={item[field.name] ?? false}
                              disabled={field.readOnly || true}
                              className="ml-2"
                            />
                          ) : field.type === "file" ? (
                            <CustomImage
                              src={item[field.name]}
                              alt={field.label}
                              className="w-12 h-12 object-cover border-none rounded-md"
                            />
                          ) : (
                            <span className="text-xs sm:text-sm text-right">
                              {field.type === "date" && item[field.name]
                                ? new Date(
                                    item[field.name]
                                  ).toLocaleDateString()
                                : item[field.name] || "-"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    <div className="mb-2 flex justify-between items-center">
                      <span className="font-medium text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                        Principal:
                      </span>
                      <div className="flex items-center">
                        <CustomInput
                          type="checkbox"
                          checked={item.is_main || false}
                          onChange={() => handleMainCheckboxChange(index)}
                          className="ml-2"
                        />
                      </div>
                    </div>
                    <div className="mb-2 flex justify-between items-center">
                      <span className="font-medium text-xs sm:text-sm text-light-muted dark:text-dark-muted">
                        Ações:
                      </span>
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
                  </div>
                ) : (
                  renderForm(index)
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isOpen && editIndex === null && renderForm(null)}

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
