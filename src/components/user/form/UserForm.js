"use client";

import {
  mapFormUserToDbUser,
  mapFormUserToAuth0User,
} from "@/businnes/indivisibleRules/userRules";
import Button from "@/components/form/button/CustomButton";
import Form from "@/components/form/Form";
import CustomInput from "@/components/form/input/CustomInput";
import { useState, useEffect, useCallback } from "react";
import useNavigationStack from "@/hooks/useNavigationStack";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaImage,
  FaLock,
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

export default function UserForm({
  userId,
  auth0ClientId,
  auth0ManagementToken: initialManagementToken,
}) {
  const [userData, setUserData] = useState({
    name: "",
    nickname: "",
    picture: "",
    birth_date: "",
    cpf: "",
    addresses: [],
    emails: [],
    telephones: [],
    connection: null,
  });
  const [mode, setMode] = useState("create");
  const [errors, setErrors] = useState({});
  const [isFetched, setIsFetched] = useState(false);
  const [auth0ManagementToken, setAuth0ManagementToken] = useState(
    initialManagementToken
  );

  const { request } = useApiService();
  const { goBack } = useNavigationStack();

  const updatedUserSchema = userSchema;

  // Função para buscar o token da API no servidor
  const fetchManagementToken = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/token/management-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar token do servidor");
      }

      setAuth0ManagementToken(data.token);
      return data.token;
    } catch (error) {
      console.error("Erro ao buscar auth0ManagementToken:", error);
      throw error;
    }
  }, []);

  // Garante que o token esteja disponível antes de usar
  const ensureManagementToken = useCallback(async () => {
    if (!auth0ManagementToken) {
      return await fetchManagementToken();
    }
    return auth0ManagementToken;
  }, [auth0ManagementToken, fetchManagementToken]);

  // Carrega os dados do usuário existente
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
                telephone: applyTelephoneMask(phone.full_number),
              }))
            : [],
          connection: data.sub ? data.sub.split("|")[0] : null,
        });
        setIsFetched(true);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setIsFetched(true);
      }
    },
    [request, applyTelephoneMask]
  );

  // Define o modo (create ou edit) com base no userId
  useEffect(() => {
    if (userId && !isFetched) {
      setMode("edit");
      fetchUserData(userId);
    } else if (!userId) {
      setMode("create");
      setIsFetched(false);
    }
  }, [userId, fetchUserData, isFetched]);

  // Valida campos individualmente
  const validateField = useCallback(
    async (fieldPath, value, fullData) => {
      try {
        await updatedUserSchema.validateAt(fieldPath, fullData, {
          abortEarly: false,
        });
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
    },
    [updatedUserSchema]
  );

  // Verifica se há itens principais (ex.: email ou telefone principal)
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

  // Manipula mudanças em campos simples
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

  // Manipula mudanças no CPF com máscara
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

  // Manipula mudanças no telefone com máscara
  const handleTelephoneChange = useCallback(
    (e, setFormData, validateField) => {
      const maskedValue = applyTelephoneMask(e.target.value);
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

  // Salva dados de subformulários (endereços, emails, telefones)
  const handleContextSave = useCallback(
    (field) => (items) => {
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

  // Gera uma senha padrão aleatória
  const generateDefaultPassword = useCallback(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!/[A-Z]/.test(password)) {
      password = "A" + password.slice(1);
    }
    if (!/[0-9]/.test(password)) {
      password = password.slice(0, -1) + "1";
    }
    return password;
  }, []);

  // Cria um usuário no Auth0
  const createAuth0User = useCallback(
    async (userData) => {
      const token = await ensureManagementToken();
      const primaryEmail = userData.emails.find((e) => e.is_main)?.email;
      if (!primaryEmail) throw new Error("E-mail principal é necessário");

      const defaultPassword = generateDefaultPassword();
      const payload = {
        email: primaryEmail,
        password: defaultPassword,
        name: userData.name,
        nickname: userData.nickname,
        picture: userData.picture,
        connection: "Username-Password-Authentication",
        email_verified: false,
      };

      const response = await request(`/api/v2/users`, {
        method: "POST",
        data: payload,
        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
        token,
      });

      await request(`/dbconnections/change_password`, {
        method: "POST",
        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
        data: {
          client_id: auth0ClientId,
          email: primaryEmail,
          connection: "Username-Password-Authentication",
        },
      });

      return response.user_id;
    },
    [request, auth0ClientId, ensureManagementToken]
  );

  // Atualiza um usuário no Auth0
  const updateAuth0User = useCallback(
    async (sub, userData) => {
      const token = await ensureManagementToken();

      await request(`/api/v2/users/${sub}`, {
        method: "PATCH",
        data: userData,
        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
        token,
      });
    },
    [request, ensureManagementToken]
  );

  // Solicita redefinição de senha
  const requestPasswordReset = useCallback(async () => {
    const primaryEmail = userData.emails.find((e) => e.is_main)?.email;
    try {
      await request(`/dbconnections/change_password`, {
        method: "POST",
        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
        data: {
          client_id: auth0ClientId,
          email: primaryEmail,
          connection: "Username-Password-Authentication",
        },
      });
      setErrors({
        success: "Email de redefinição de senha enviado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      setErrors({ submit: "Erro ao enviar email de redefinição de senha" });
    }
  }, [request, auth0ClientId, userData]);

  // Manipula o envio do formulário
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        await updatedUserSchema.validate(userData, { abortEarly: false });
        const dbMappedUser = mapFormUserToDbUser(userData);

        if (mode === "create") {
          const auth0Id = await createAuth0User(userData);
          dbMappedUser.sub = auth0Id;
          await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dbMappedUser),
          });
        } else if (mode === "edit") {
          const auth0mappedUser = mapFormUserToAuth0User(userData);

          await updateAuth0User(userData.sub, auth0mappedUser);

          await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(dbMappedUser),
          });
        }

        setErrors({});
        goBack();
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          const errorMap = {};
          err.inner.forEach((error) => {
            errorMap[error.path] = error.message;
          });
          setErrors(errorMap);
        } else {
          setErrors({ submit: "Erro ao salvar: " + err.message });
        }
      }
    },
    [userData, mode, userId, request, goBack, createAuth0User, updateAuth0User]
  );

  // Busca endereço pelo CEP
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

  // Limpeza de URLs de blobs
  useEffect(() => {
    return () => {
      if (userData.picture && userData.picture.startsWith("blob:")) {
        URL.revokeObjectURL(userData.picture);
      }
    };
  }, [userData.picture]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="pl-4 pt-5 pb-10 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border-b border-r border-light-border dark:border-dark-border transition-all duration-300">
        <div className="flex items-center gap-2">
          <FaEdit className="w-8 h-8 text-light-primary dark:text-dark-primary" />
          <div>
            <h1 className="text-xl font-semibold text-light-text dark:text-dark-text">
              {mode === "create" ? "Criando usuário" : "Alterando usuário"}
            </h1>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Preencha os dados abaixo para{" "}
              {mode === "create" ? "criar" : "alterar"} o perfil
            </p>
          </div>
        </div>
      </header>

      <Form onSubmit={handleSubmit}>
        <main className="p-2 sm:p-4 md:p-6 mb-14 flex-1">
          <section className="mb-14 bg-light-background-form-primary dark:bg-dark-background-form-primary">
            <h2 className="flex items-center pb-4 gap-2 text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
              <MdPerson className="w-6 h-6 sm:w-10 sm:h-10 text-light-primary dark:text-dark-primary" />{" "}
              Informações Pessoais
            </h2>
            <div className="pt-2 space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-base text-light-primary dark:text-dark-primary transition-colors duration-200 ease-in-out">
                      Foto
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
                    className="w-full md:w-fit text-light-text dark:text-dark-text"
                  />
                  <CustomInput
                    label="CPF"
                    name="cpf"
                    value={userData.cpf}
                    onChange={handleCpfChange}
                    disabled={mode === "view"}
                    maxLength={14}
                    error={errors.cpf}
                    className="w-full md:w-fit text-light-text dark:text-dark-text"
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
                { name: "zip_code", label: "CEP", type: "number" },
                { name: "street", label: "Rua/Avenida" },
                { name: "number", label: "Número", type: "number" },
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
                  onChange: handleTelephoneChange,
                },
              ]}
              initialData={userData.telephones}
              schema={userSchema.fields.telephones.innerType}
              onSave={handleContextSave("telephones")}
              errors={errors.telephones}
              width="md:w-[35rem]"
            />

            <section className="bg-light-background-form-primary dark:bg-dark-background-form-primary">
              <div className="flex items-center pb-4 gap-2 text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
                <FaLock className="w-5 h-5 sm:w-6 sm:h-6 text-light-primary dark:text-dark-primary" />
                Senha
              </div>
              <div className="pt-2">
                {mode === "create" && (
                  <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    Uma senha temporária será gerada e um email de redefinição
                    será enviado ao usuário.
                  </p>
                )}
                {mode === "edit" && (
                  <>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={requestPasswordReset}
                      className="px-4 py-2 text-light-text dark:text-dark-text bg-light-primary dark:bg-dark-primary hover:bg-light-primary-dark dark:hover:bg-dark-primary-dark rounded-md w-auto"
                    >
                      Enviar Email de Redefinição de Senha
                    </Button>
                    {errors.success && (
                      <p className="mt-2 text-sm text-green-500">
                        {errors.success}
                      </p>
                    )}
                    {errors.submit && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.submit}
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </main>

        {mode !== "view" && (
          <footer className="pl-4 pb-5 pt-10 space-x-2 border-light-border dark:border-dark-border bg-light-background-form-secondary dark:bg-dark-background-form-secondary transition-all duration-300 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
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
    </div>
  );
}
