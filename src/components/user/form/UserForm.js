"use client";

import { mapFormUserToDbUser } from "@/businnes/indivisibleRules/userRules";
import Button from "@/components/form/button/Button";
import Form from "@/components/form/Form";
import CustomInput from "@/components/form/input/CustomInput";
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
import useApiService from "@/hooks/useApiService";
import {
  applyCPFMask,
  applyTelephoneMask,
} from "@/businnes/indivisibleRules/generalRules";

export default function UserForm({ userId }) {
  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    picture: "",
    birth_date: "",
    cpf: "",
    addresses: [],
    emails: [],
    telephones: [],
  });
  const [mode, setMode] = useState("create");
  const [errors, setErrors] = useState({});
  const [isFetched, setIsFetched] = useState(false); // Novo estado para evitar loop

  const { request } = useApiService();

  const fetchUserData = useCallback(
    async (id) => {
      try {
        const data = await request(`/api/users/${id}`, { method: "GET" });
        setUserData({
          sub: data.sub,
          name: data.name || "",
          nickname: data.nickname || "",
          picture: data.picture || "",
          birth_date: data.birth_date
            ? new Date(data.birth_date).toISOString().split("T")[0]
            : "",
          cpf: data.cpf || "",
          addresses: Array.isArray(data.address) ? data.address : [],
          emails: Array.isArray(data.email)
            ? data.email.map((email) => ({
                ...email,
                email_verified: email.email_verified ?? false,
              }))
            : [],
          telephones: Array.isArray(data.telephone)
            ? data.telephone.map((phone) => ({
                ...phone,
                telephone: applyTelephoneMask(phone.full_number), // Adiciona o campo "telephone" formatado
              }))
            : [],
        });

        setIsFetched(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsFetched(true);
      }
    },
    [request, applyTelephoneMask] // Adicione applyTelephoneMask como dependência
  );

  useEffect(() => {
    if (userId && !isFetched) {
      setMode("edit");
      fetchUserData(userId);
    } else if (!userId) {
      setMode("create");
      setIsFetched(false);
    }
  }, [userId]);

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
        newErrors[field] = `Pelo menos um ${
          field === "addresses"
            ? "endereço"
            : field === "emails"
              ? "e-mail"
              : "telefone"
        } deve ser marcado como principal`;
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
      setUserData((prev) => {
        const updatedData = { ...prev, cpf: maskedValue };
        validateField("cpf", maskedValue, updatedData);
        return updatedData;
      });
    },
    [validateField]
  );

  const handleTelephoneChange = useCallback(
    (e, setFormData, validateField) => {
      const maskedValue = applyTelephoneMask(e.target.value); // Sem o parâmetro type
      setFormData((prev) => {
        const updatedFormData = { ...prev, telephone: maskedValue };
        validateField(
          "telephone",
          maskedValue.replace(/\s+/g, ""),
          updatedFormData
        );
        return updatedFormData;
      });
    },
    [applyTelephoneMask]
  );

  const handleContextSave = useCallback(
    (field) => (items) => {
      // Converte campos numéricos para número ao salvar no userData
      const adjustedItems = items.map((item) => {
        const adjustedItem = { ...item };
        if (field === "addresses") {
          if (adjustedItem.zip_code) {
            adjustedItem.zip_code = Number(adjustedItem.zip_code);
          }
          if (adjustedItem.number) {
            adjustedItem.number = Number(adjustedItem.number);
          }
        }
        return adjustedItem;
      });

      const updatedData = { ...userData, [field]: adjustedItems };
      setUserData(updatedData);
      checkMainItems(field, updatedData);
    },
    [userData, checkMainItems]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        console.log("Submitting userData:", userData);
        await userSchema.validate(userData, { abortEarly: false });
        const mappedUser = mapFormUserToDbUser(userData);
        const userResponse = await request("/api/users", {
          method: "POST",
          data: mappedUser,
        });
        console.log("Resposta do servidor:", userResponse);
        setErrors({});
      } catch (err) {
        console.error("Erro de validação:", err);
        if (err instanceof Yup.ValidationError) {
          const errorMap = {};
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message;
            console.log(`Field: ${error.path}, Error: ${error.message}`); // Add this line
          });
          setErrors(errorMap);
          console.log("Erros de validação mapeados:", errorMap);
        } else {
          setErrors({ submit: "Erro ao salvar: " + err.message });
        }
      }
    },
    [userData, request]
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
            district: data.bairro || "",
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
      <main className="p-2 sm:p-4 md:p-6 mb-14">
        <section className="mb-14 bg-light-background-form-primary dark:bg-dark-background-form-primary">
          <h2 className="flex items-center pb-4 gap-2 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
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
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-light-border dark:border-dark-border">
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
                    </div>
                    {/* Removido o input de arquivo e mensagens relacionadas */}
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
              </div>
            </div>
          </div>
        </section>
        <div className="space-y-14">
          <SubForm
            title="Endereços"
            icon={FaMapMarkerAlt}
            fields={[
              { name: "zip_code", label: "CEP", type: "number" }, // Adicionado type: "number"
              { name: "street", label: "Rua/Avenida" },
              { name: "number", label: "Número", type: "number" }, // Adicionado type: "number"
              { name: "complement", label: "Complemento" },
              { name: "district", label: "Bairro" },
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
            fields={[
              { name: "email", label: "E-mail" },
              {
                name: "email_verified",
                label: "Email Verificado?",
                type: "checkbox",
                readOnly: true,
              },
            ]}
            initialData={userData.emails}
            schema={userSchema.fields.emails.innerType}
            onSave={handleContextSave("emails")}
            errors={errors.emails}
            width="md:w-[35rem]"
            defaultValues={{ email_verified: false }}
          />
          <SubForm
            title="Telefones"
            icon={FaPhone}
            fields={[
              {
                name: "type",
                label: "Tipo",
                type: "select",
                options: [
                  { value: "Pessoal", label: "Pessoal" },
                  { value: "Profissional", label: "Profissional" },
                ],
              },
              {
                name: "telephone",
                label: "Telefone",
                onChange: handleTelephoneChange, // Passamos a função diretamente
              },
            ]}
            initialData={userData.telephones}
            schema={userSchema.fields.telephones.innerType}
            onSave={handleContextSave("telephones")}
            errors={errors.telephones}
            width="md:w-[35rem]"
          />
        </div>
      </main>

      {mode !== "view" && (
        <footer className="p-2 space-x-2 border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary transition-all duration-300 border-t">
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
