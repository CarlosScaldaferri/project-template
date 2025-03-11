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
import CustomImage from "@/components/form/image/CustomImage";

export default function UserForm({ userId }) {
  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    picture: "",
    fileName: "",
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
      setUserData({
        ...data,
        picture: data.picture || "",
        fileName: "",
      });
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

  // Cleanup para liberar URL de blob
  useEffect(() => {
    return () => {
      if (userData.picture && userData.picture.startsWith("blob:")) {
        URL.revokeObjectURL(userData.picture);
      }
    };
  }, [userData.picture]);

  return (
    <Form onSubmit={handleSubmit}>
      <main className="p-2 sm:p-4 md:p-6 mb-14 space-y-6">
        <section className="mb-14 bg-light-background-form-primary dark:bg-dark-background-form-primary rounded-md">
          <h2 className="flex items-center pb-2 gap-2 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
            <MdPerson className="w-8 h-8 sm:w-10 sm:h-10 text-light-primary dark:text-dark-primary" />{" "}
            Informações Pessoais
          </h2>
          <div className="pt-2 space-y-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                {/* Componente de seleção de foto */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-light-text dark:text-dark-text font-medium">
                    <FaImage className="w-5 h-5" />
                    Foto do Perfil
                  </label>
                  <div className="flex flex-col gap-2">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-light-border dark:border-dark-border group">
                      {userData.picture ? (
                        <CustomImage
                          src={userData.picture}
                          alt="Foto do usuário"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-light-background-form-secondary dark:bg-dark-background-form-secondary flex items-center justify-center">
                          <FaImage className="w-8 h-8 text-light-text dark:text-dark-text opacity-50" />
                        </div>
                      )}
                      {mode !== "view" && (
                        <>
                          <input
                            type="file"
                            id="pictureInput"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                if (file.size > 5 * 1024 * 1024) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    picture: "A imagem deve ter no máximo 5MB",
                                  }));
                                  return;
                                }
                                const imageUrl = URL.createObjectURL(file);
                                setUserData((prev) => ({
                                  ...prev,
                                  picture: imageUrl,
                                  fileName: file.name,
                                }));
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors.picture;
                                  return newErrors;
                                });
                              }
                            }}
                            disabled={mode === "view"}
                            className="hidden"
                          />
                          <label
                            htmlFor="pictureInput"
                            className="absolute inset-0 flex items-center justify-center bg-transparent text-light-primary dark:text-dark-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer hover:bg-light-accent dark:hover:bg-dark-accent hover:bg-opacity-50"
                          >
                            Escolher foto
                          </label>
                        </>
                      )}
                    </div>
                    {userData.fileName && (
                      <span className="text-sm text-light-text dark:text-dark-text opacity-75">
                        {userData.fileName}
                      </span>
                    )}
                    {mode !== "view" && (
                      <p className="text-sm text-light-text dark:text-dark-text opacity-75">
                        Formatos aceitos: JPG, PNG, até 5MB
                      </p>
                    )}
                  </div>
                  {errors.picture && (
                    <span className="text-red-500 text-sm">
                      {errors.picture}
                    </span>
                  )}
                </div>

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
