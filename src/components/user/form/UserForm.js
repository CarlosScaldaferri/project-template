"use client";

import { applyCPFMask } from "@/businnes/indivisibleRules/userRules";
import Button from "@/components/form/button/Button";
import Form from "@/components/form/Form";
import CustomImage from "@/components/form/image/CustomImage";
import CustomInput from "@/components/form/input/CustomInput";
import CustomSelect from "@/components/form/select/CustomSelect";
import { useHeader } from "@/contexts/HeaderContext";
import { useState, useEffect, useCallback } from "react";
import {
  FaPlus,
  FaEdit,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";
import { FiTrash2 } from "react-icons/fi";
import { MdPerson } from "react-icons/md";
import * as Yup from "yup";
import { userSchema } from "@/schemas/userSchema";

export default function UserForm({ userId }) {
  const [userData, setUserData] = useState(() => ({
    name: "",
    nickname: "",
    picture: "",
    birth_date: "",
    cpf: "",
    gender: "",
    addresses: [
      {
        id: Date.now(),
        zip_code: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        country: "",
        is_main: false,
      },
    ],
    emails: [
      { id: Date.now(), email: "", is_main: false, email_verified: false },
    ],
    phones: [{ id: Date.now(), phone: "", is_main: false }],
  }));
  const [mode, setMode] = useState("create");
  const [errors, setErrors] = useState({});

  const fetchUserData = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/users/${id}`);
      if (!response.ok) throw new Error("Erro ao buscar dados do usuário");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      setMode("edit");
      fetchUserData(userId);
    } else {
      setMode("create");
    }
  }, [userId, fetchUserData]);

  const validateField = useCallback(async (fieldPath, value, fullData) => {
    try {
      await userSchema.validateAt(fieldPath, fullData, { abortEarly: false });
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldPath];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const errorMap = {};
        err.inner.forEach((error) => {
          if (!error.message.includes("principal")) {
            errorMap[error.path] = error.message;
          }
        });
        setErrors((prev) => ({ ...prev, ...errorMap }));
      }
    }
  }, []);

  const checkMainItems = useCallback((field, data) => {
    const hasMain = data[field].some((item) => item.is_main);
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (!hasMain) {
        newErrors[field] =
          `Pelo menos um ${field === "addresses" ? "endereço" : field === "emails" ? "e-mail" : "telefone"} deve ser marcado como principal`;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  const handleChange = useCallback(
    (e, index, field) => {
      const { name, value, type, checked } = e.target;
      let updatedData;

      if (field && typeof index === "number") {
        updatedData = {
          ...userData,
          [field]: userData[field].map((item, i) =>
            i === index
              ? { ...item, [name]: type === "checkbox" ? checked : value }
              : item
          ),
        };
        setUserData(updatedData);
        validateField(
          `${field}[${index}].${name}`,
          type === "checkbox" ? checked : value,
          updatedData
        );
      } else {
        updatedData = {
          ...userData,
          [name]: type === "checkbox" ? checked : value,
        };
        setUserData(updatedData);
        validateField(name, type === "checkbox" ? checked : value, updatedData);
      }
    },
    [userData, validateField]
  );

  const handleCpfChange = useCallback(
    (e) => {
      const maskedValue = applyCPFMask(e.target.value);
      const updatedData = { ...userData, cpf: maskedValue };
      setUserData(updatedData);
      validateField("cpf", maskedValue, updatedData);
    },
    [userData, validateField]
  );

  const createEmptyAddress = () => ({
    id: Date.now(),
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "",
    is_main: false,
  });

  const createEmptyEmail = () => ({
    id: Date.now(),
    email: "",
    is_main: false,
    email_verified: false,
  });

  const createEmptyPhone = () => ({
    id: Date.now(),
    phone: "",
    is_main: false,
  });

  const addItem = useCallback(
    (field) => {
      const updatedData = {
        ...userData,
        [field]: [
          ...userData[field],
          field === "addresses"
            ? createEmptyAddress()
            : field === "emails"
              ? createEmptyEmail()
              : createEmptyPhone(),
        ],
      };
      setUserData(updatedData);
      checkMainItems(field, updatedData); // Verifica após adicionar
    },
    [userData, checkMainItems]
  );

  const removeItem = useCallback(
    (field, index) => {
      const updatedData = {
        ...userData,
        [field]: userData[field].filter((_, i) => i !== index),
      };
      setUserData(updatedData);
      checkMainItems(field, updatedData); // Verifica após remover
    },
    [userData, checkMainItems]
  );

  const handleMainToggle = useCallback(
    (field, index) => {
      const updatedData = {
        ...userData,
        [field]: userData[field].map((item, i) => ({
          ...item,
          is_main: i === index ? !item.is_main : false,
        })),
      };
      setUserData(updatedData);
      checkMainItems(field, updatedData);
    },
    [userData, checkMainItems]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await userSchema.validate(userData, { abortEarly: false });
        setErrors({});
        console.log("Formulário enviado:", userData);
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errorMap = {};
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message;
          });
          setErrors(errorMap);
          console.log("Erros de validação:", errorMap);
        }
      }
    },
    [userData]
  );

  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Novo Usuário",
      subtitle: "Preencha os dados abaixo para criar o perfil",
      icon: FaEdit,
    });
  }, [setHeaderConfig]);

  return (
    <Form onSubmit={handleSubmit} className="w-full">
      <main className="p-6 space-y-8">
        <section className="border border-light-border dark:border-dark-border">
          <h2 className="flex items-center p-6 gap-2 border-b text-lg font-semibold border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
            <MdPerson className="w-8 h-8" /> Informações Pessoais
          </h2>
          <div className="p-6 space-y-6">
            <label className="relative w-32 h-32 block group shrink-0 border border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary rounded-md">
              {userData.picture ? (
                <CustomImage
                  src={userData.picture}
                  alt="Foto do usuário"
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <MdPerson className="w-[7.9rem] h-[7.9rem] text-light-background dark:text-dark-background bg-light-background-sidebar dark:bg-dark-background-sidebar rounded-md" />
              )}
              {mode !== "view" && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                    <span className="font-medium text-white">Alterar</span>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    disabled={mode === "view"}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const imageUrl = URL.createObjectURL(file);
                        setUserData((prev) => ({ ...prev, picture: imageUrl }));
                      }
                    }}
                  />
                </>
              )}
            </label>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <CustomInput
                  label="Nome"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.name}
                />
                <CustomInput
                  label="Apelido"
                  name="nickname"
                  value={userData.nickname}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.nickname}
                />
                <CustomInput
                  label="Data de Nascimento"
                  type="date"
                  name="birth_date"
                  value={userData.birth_date}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.birth_date}
                />
                <CustomInput
                  label="CPF"
                  name="cpf"
                  value={userData.cpf}
                  onChange={handleCpfChange}
                  disabled={mode === "view"}
                  maxLength={14}
                  error={errors.cpf}
                />
                <CustomSelect
                  label="Gênero"
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  options={[
                    { value: "", label: "" },
                    { value: "masculino", label: "Masculino" },
                    { value: "feminino", label: "Feminino" },
                    { value: "outro", label: "Outro" },
                    { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
                  ]}
                  error={errors.gender}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-l border-r border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
                <FaMapMarkerAlt className="w-6 h-6" /> Endereços
              </h2>
              {errors.addresses && (
                <span className="text-sm text-light-danger dark:text-dark-danger mt-1">
                  {errors.addresses}
                </span>
              )}
            </div>
            {mode !== "view" && (
              <button
                type="button"
                onClick={() => addItem("addresses")}
                className="flex items-center gap-1 text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary"
              >
                <FaPlus />
              </button>
            )}
          </div>
          {userData.addresses.map((address, index) => (
            <div
              key={address.id}
              className="pb-5 pl-5 pr-5 bg-light-background-secondary dark:bg-dark-background-secondary border-b border-light-border dark:border-dark-border"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <CustomInput
                  label="CEP"
                  name="zip_code"
                  value={address.zip_code}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].zip_code`]}
                />
                <CustomInput
                  label="Rua/Avenida"
                  name="street"
                  value={address.street}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].street`]}
                />
                <CustomInput
                  label="Número"
                  name="number"
                  value={address.number}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].number`]}
                />
                <CustomInput
                  label="Complemento"
                  name="complement"
                  value={address.complement}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].complement`]}
                />
                <CustomInput
                  label="Bairro"
                  name="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].neighborhood`]}
                />
                <CustomInput
                  label="Cidade"
                  name="city"
                  value={address.city}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].city`]}
                />
                <CustomInput
                  label="Estado"
                  name="state"
                  value={address.state}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].state`]}
                />
                <CustomInput
                  label="País"
                  name="country"
                  value={address.country}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                  error={errors[`addresses[${index}].country`]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <CustomInput
                  type="checkbox"
                  checked={address.is_main}
                  onChange={() => handleMainToggle("addresses", index)}
                  disabled={mode === "view"}
                  label="Principal"
                />
                {mode !== "view" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem("addresses", index)}
                      className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4 border-t border-l border-r border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
                <FaEnvelope className="w-6 h-6" /> E-mails
              </h2>
              {errors.emails && (
                <span className="text-sm text-light-danger dark:text-dark-danger mt-1">
                  {errors.emails}
                </span>
              )}
            </div>
            {mode !== "view" && (
              <button
                type="button"
                onClick={() => addItem("emails")}
                className="flex items-center gap-1 text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary"
              >
                <FaPlus />
              </button>
            )}
          </div>
          {userData.emails.map((email, index) => (
            <div
              key={email.id}
              className="pb-5 pl-5 pr-5 space-y-4 bg-light-background-secondary dark:bg-dark-background-secondary border-b border-light-border dark:border-dark-border"
            >
              <div className="grid grid-cols-1 gap-4">
                <CustomInput
                  label="E-mail"
                  name="email"
                  value={email.email}
                  onChange={(e) => handleChange(e, index, "emails")}
                  disabled={mode === "view"}
                  error={errors[`emails[${index}].email`]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="checkbox"
                  checked={email.is_main}
                  onChange={() => handleMainToggle("emails", index)}
                  disabled={mode === "view"}
                  label="Principal"
                />
                {mode !== "view" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem("emails", index)}
                      className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <section className="space-y-4 border-t border-l border-r border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
                <FaPhone className="w-6 h-6" /> Telefones
              </h2>
              {errors.phones && (
                <span className="text-sm text-light-danger dark:text-dark-danger mt-1">
                  {errors.phones}
                </span>
              )}
            </div>
            {mode !== "view" && (
              <button
                type="button"
                onClick={() => addItem("phones")}
                className="flex items-center gap-1 text-light-accent dark:text-dark-accent hover:text-light-primary dark:hover:text-dark-primary"
              >
                <FaPlus />
              </button>
            )}
          </div>
          {userData.phones.map((phone, index) => (
            <div
              key={phone.id}
              className="pb-5 pl-5 pr-5 space-y-4 bg-light-background-secondary dark:bg-dark-background-secondary border-b border-light-border dark:border-dark-border"
            >
              <div className="grid grid-cols-1 gap-4">
                <CustomInput
                  label="Telefone"
                  name="phone"
                  value={phone.phone}
                  onChange={(e) => handleChange(e, index, "phones")}
                  disabled={mode === "view"}
                  error={errors[`phones[${index}].phone`]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="checkbox"
                  checked={phone.is_main}
                  onChange={() => handleMainToggle("phones", index)}
                  disabled={mode === "view"}
                  label="Principal"
                />
                {mode !== "view" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeItem("phones", index)}
                      className="text-light-danger dark:text-dark-danger hover:text-light-danger-dark dark:hover:text-dark-danger-dark"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      </main>

      {mode !== "view" && (
        <footer className="p-6 flex justify-end gap-4 border-t border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary transition-all duration-300">
          <Button type="button" variant="secondary">
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Salvar
          </Button>
        </footer>
      )}
    </Form>
  );
}
