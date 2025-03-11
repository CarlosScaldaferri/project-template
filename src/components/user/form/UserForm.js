"use client";

import { applyCPFMask } from "@/businnes/indivisibleRules/userRules";
import Button from "@/components/form/button/Button";
import Form from "@/components/form/Form";
import CustomInput from "@/components/form/input/CustomInput";
import CustomSelect from "@/components/form/select/CustomSelect";
import { useHeader } from "@/contexts/HeaderContext";
import { useState, useEffect, useCallback } from "react";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaImage,
} from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import * as Yup from "yup";
import { userSchema } from "@/schemas/userSchema";
import SubForm from "@/components/form/subForm/SubForm";

export default function UserForm({ userId }) {
  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    pictures: [], // Changed from picture to pictures array
    birth_date: "",
    cpf: "",
    gender: "",
    addresses: [],
    emails: [],
    phones: [],
  });
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
          `Pelo menos um ${field === "addresses" ? "endereço" : field === "emails" ? "e-mail" : field === "phones" ? "telefone" : "imagem"} deve ser marcado como principal`;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      const updatedData = {
        ...userData,
        [name]: type === "checkbox" ? checked : value,
      };
      setUserData(updatedData);
      validateField(name, type === "checkbox" ? checked : value, updatedData);
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

  const handleContextSave = useCallback(
    (field) => (items) => {
      const updatedData = { ...userData, [field]: items };
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

  const fetchAddressByCep = useCallback(async (cep, setFormData, setErrors) => {
    try {
      const cleanedCep = cep.replace(/\D/g, "");
      if (cleanedCep.length === 8) {
        const response = await fetch(
          `https://viacep.com.br/ws/${cleanedCep}/json/`
        );
        const data = await response.json();
        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
            country: "Brasil",
          }));
        } else {
          setErrors((prev) => ({ ...prev, zip_code: "CEP inválido" }));
        }
      }
    } catch (error) {
      console.error("Erro ao consultar CEP:", error);
      setErrors((prev) => ({ ...prev, zip_code: "Erro ao consultar CEP" }));
    }
  }, []);

  const { setHeaderConfig } = useHeader();

  useEffect(() => {
    setHeaderConfig({
      title: "Usuários - Lista de Usuários - Novo Usuário",
      subtitle: "Preencha os dados abaixo para criar o perfil",
      icon: FaEdit,
    });
  }, [setHeaderConfig]);

  // Get the main picture
  const mainPicture = userData.pictures.find((pic) => pic.is_main)?.url || "";

  return (
    <Form onSubmit={handleSubmit}>
      <main className="p-2 sm:p-4 md:p-6 mb-14 space-y-6">
        <section className="mb-14 bg-light-background-form-primary dark:bg-dark-background-form-primary rounded-md">
          <h2 className="flex items-center pb-2 gap-2 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
            <MdPerson className="w-8 h-8 sm:w-10 sm:h-10 text-light-primary dark:text-dark-primary" />{" "}
            Informações Pessoais
          </h2>
          <div className="pt-2 space-y-6">
            <SubForm
              title="Fotos"
              icon={FaImage}
              fields={[{ name: "url", label: "Fotos", type: "file" }]}
              initialData={userData.pictures}
              schema={userSchema.fields.pictures.innerType}
              onSave={handleContextSave("pictures")}
              errors={errors.pictures}
              width="md:w-fit"
            />

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <CustomInput
                  label="Nome"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.name}
                  className="w-full md:w-2/3 text-light-text dark:text-dark-text"
                />
                <CustomInput
                  label="Apelido"
                  name="nickname"
                  value={userData.nickname}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.nickname}
                  className="w-full md:w-1/3 text-light-text dark:text-dark-text"
                />
                <CustomInput
                  label="Data de Nascimento"
                  type="date"
                  name="birth_date"
                  value={userData.birth_date}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  error={errors.birth_date}
                  className="w-full md:w-1/4 text-light-text dark:text-dark-text"
                />
                <CustomInput
                  label="CPF"
                  name="cpf"
                  value={userData.cpf}
                  onChange={handleCpfChange}
                  disabled={mode === "view"}
                  maxLength={14}
                  error={errors.cpf}
                  className="w-full md:w-1/4 text-light-text dark:text-dark-text"
                />
                <CustomSelect
                  label="Gênero"
                  name="gender"
                  value={userData.gender}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  options={[
                    { value: "", label: "Selecione" },
                    { value: "masculino", label: "Masculino" },
                    { value: "feminino", label: "Feminino" },
                    { value: "outro", label: "Outro" },
                    { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
                  ]}
                  error={errors.gender}
                  className="w-full md:w-1/3 text-light-text dark:text-dark-text"
                />
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-14">
          <SubForm
            title="Endereços"
            icon={FaMapMarkerAlt}
            fields={[
              { name: "zip_code", label: "CEP" },
              { name: "street", label: "Rua/Avenida" },
              { name: "number", label: "Número" },
              { name: "complement", label: "Complemento" },
              { name: "neighborhood", label: "Bairro" },
              { name: "city", label: "Cidade" },
              { name: "state", label: "Estado" },
              { name: "country", label: "País" },
            ]}
            initialData={userData.addresses}
            schema={userSchema.fields.addresses.innerType}
            onSave={handleContextSave("addresses")}
            errors={errors.addresses}
            fetchAddressByCep={fetchAddressByCep}
          />
          <SubForm
            title="E-mails"
            icon={FaEnvelope}
            fields={[{ name: "email", label: "E-mail" }]}
            initialData={userData.emails}
            schema={userSchema.fields.emails.innerType}
            onSave={handleContextSave("emails")}
            errors={errors.emails}
            width="md:w-[25rem]"
          />
          <SubForm
            title="Telefones"
            icon={FaPhone}
            fields={[{ name: "phone", label: "Telefone" }]}
            initialData={userData.phones}
            schema={userSchema.fields.phones.innerType}
            onSave={handleContextSave("phones")}
            errors={errors.phones}
            width="md:w-[25rem]"
          />
        </div>
      </main>

      {mode !== "view" && (
        <footer className="p-2 space-x-2 bg-light-background-form-primary dark:bg-dark-background-form-primary border-t border-light-border dark:border-dark-border shadow-sm rounded-b-lg">
          <Button
            type="button"
            variant="secondary"
            className="px-4 py-2 text-light-text dark:text-dark-text bg-light-background-form-secondary dark:bg-dark-background-form-secondary hover:bg-light-accent dark:hover:bg-dark-accent rounded-md w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="px-4 py-2 text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark rounded-md w-auto"
          >
            Salvar
          </Button>
        </footer>
      )}
    </Form>
  );
}
