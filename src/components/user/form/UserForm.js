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

  const handleChange = useCallback((e, index, field) => {
    const { name, value, type, checked } = e.target;
    if (field && typeof index === "number") {
      setUserData((prev) => ({
        ...prev,
        [field]: prev[field].map((item, i) =>
          i === index
            ? { ...item, [name]: type === "checkbox" ? checked : value }
            : item
        ),
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  }, []);

  const handleCpfChange = useCallback((e) => {
    const maskedValue = applyCPFMask(e.target.value);
    setUserData((prev) => ({ ...prev, cpf: maskedValue }));
  }, []);

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

  const addItem = useCallback((field) => {
    setUserData((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        field === "addresses"
          ? createEmptyAddress()
          : field === "emails"
            ? createEmptyEmail()
            : createEmptyPhone(),
      ],
    }));
  }, []);

  const removeItem = useCallback((field, index) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleMainToggle = useCallback((field, index) => {
    setUserData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => ({
        ...item,
        is_main: i === index ? !item.is_main : false,
      })),
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!e.currentTarget.checkValidity()) {
        e.currentTarget.reportValidity();
        return;
      }
      console.log("Formulário enviado:", userData);
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
  }, []);

  return (
    <Form onSubmit={handleSubmit} className="w-full">
      <main className="p-6 space-y-8 bg-light-background-form-primary dark:bg-dark-background-form-primary">
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                  <span className="font-medium text-white">Alterar</span>
                </div>
              )}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                disabled={mode === "view"}
                onChange={(e) => {
                  /* ... */
                }}
              />
            </label>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <CustomInput
                  label="Nome"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Apelido"
                  name="nickname"
                  value={userData.nickname}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Data de Nascimento"
                  type="date"
                  name="birth_date"
                  value={userData.birth_date}
                  onChange={handleChange}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="CPF"
                  name="cpf"
                  value={userData.cpf}
                  onChange={handleCpfChange}
                  disabled={mode === "view"}
                  maxLength={14}
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
                />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 border-t border-l border-r border-light-border dark:border-dark-border">
          <div className="flex items-center justify-between p-6 border-b border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
              <FaMapMarkerAlt className="w-6 h-6" /> Endereços
            </h2>
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
                />
                <CustomInput
                  label="Rua/Avenida"
                  name="street"
                  value={address.street}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Número"
                  name="number"
                  value={address.number}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Complemento"
                  name="complement"
                  value={address.complement}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Bairro"
                  name="neighborhood"
                  value={address.neighborhood}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Cidade"
                  name="city"
                  value={address.city}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="Estado"
                  name="state"
                  value={address.state}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
                <CustomInput
                  label="País"
                  name="country"
                  value={address.country}
                  onChange={(e) => handleChange(e, index, "addresses")}
                  disabled={mode === "view"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <CustomInput
                  type="checkbox"
                  checked={address.is_main}
                  onChange={() => handleMainToggle("addresses", index)}
                  disabled={mode === "view"}
                  label={`Principal`}
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
            <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
              <FaEnvelope className="w-6 h-6" /> E-mails
            </h2>
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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="checkbox"
                  checked={email.is_main}
                  onChange={() => handleMainToggle("emails", index)}
                  disabled={mode === "view"}
                  label={`Principal`}
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
            <h2 className="text-lg font-semibold flex items-center gap-2 text-light-text dark:text-dark-text">
              <FaPhone className="w-6 h-6" /> Telefones
            </h2>
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
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CustomInput
                  type="checkbox"
                  checked={phone.is_main}
                  onChange={() => handleMainToggle("phones", index)}
                  disabled={mode === "view"}
                  label={`Principal`}
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
