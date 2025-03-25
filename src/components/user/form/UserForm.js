"use client";
import { useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "@/components/form/button/CustomButton";
import Form from "@/components/form/Form";
import CustomInput from "@/components/form/input/CustomInput";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaImage,
  FaLock,
} from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import { userSchema } from "@/schemas/userSchema";
import SubForm from "@/components/form/subForm/SubForm";
import CustomImage from "@/components/form/image/CustomImage";
import useApiService from "@/hooks/useApiService";
import {
  applyCPFMask,
  applyTelephoneMask,
} from "@/businnes/rules/generalRules";
import {
  mapFormUserToAuth0User,
  mapFormUserToDbUser,
} from "@/businnes/mappers/userMapper";
import { useFormState } from "@/contexts/FormContext";
import { fetchUserData } from "@/services/userService";

export default function UserForm({
  userId,
  auth0ClientId,
  auth0ManagementToken: initialManagementToken,
}) {
  const formId = userId ? `user-${userId}` : "user-create";
  const {
    mode,
    isFetched,
    auth0ManagementToken,
    setMode,
    setIsFetched,
    setAuth0ManagementToken,
    resetForm,
  } = useFormState(formId, initialManagementToken);
  const { request } = useApiService();
  const stableRequest = useMemo(() => request, [request]);

  const defaultValues = useMemo(
    () => ({
      name: "",
      nickname: "",
      picture: "",
      birth_date: "",
      cpf: "",
      addresses: [],
      emails: [],
      telephones: [],
      connection: null,
    }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const fetchUserDataHandler = useCallback(
    (id) =>
      fetchUserData(
        id,
        stableRequest,
        (data) => {
          const cleanData = {
            ...data,
            addresses:
              data.addresses?.filter(
                (item) => item && Object.keys(item).length > 0
              ) || [],
            emails:
              data.emails?.filter(
                (item) => item && Object.keys(item).length > 0
              ) || [],
            telephones:
              data.telephones?.filter(
                (item) => item && Object.keys(item).length > 0
              ) || [],
          };
          reset(cleanData);
          setIsFetched(true);
        },
        setIsFetched
      ),
    [stableRequest, reset, setIsFetched]
  );

  const fetchManagementToken = useCallback(async () => {
    const response = await fetch("/api/auth/token/management-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro ao buscar token");
    setAuth0ManagementToken(data.token);
    return data.token;
  }, [setAuth0ManagementToken]);

  const ensureManagementToken = useCallback(
    () => auth0ManagementToken || fetchManagementToken(),
    [auth0ManagementToken, fetchManagementToken]
  );

  useEffect(() => {
    if (!isFetched) {
      if (userId && mode !== "edit") {
        setMode("edit");
        fetchUserDataHandler(userId);
      } else if (!userId && mode !== "create") {
        setMode("create");
        reset(defaultValues);
        resetForm(defaultValues, "create");
      }
    }
  }, [
    userId,
    fetchUserDataHandler,
    isFetched,
    mode,
    setMode,
    resetForm,
    reset,
    defaultValues,
  ]);

  const fetchAddressByCep = useCallback(
    (cep, fieldPath) => {
      const cleanedCep = String(cep).replace(/\D/g, ""); // Converte para string para a API
      if (cleanedCep.length !== 8) {
        return;
      }
      fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`)
        .then((res) => res.json())
        .then((data) => {
          if (!data.erro) {
            setValue(`${fieldPath}.street`, data.logradouro || "", {
              shouldValidate: true,
            });
            setValue(`${fieldPath}.district`, data.bairro || "", {
              shouldValidate: true,
            });
            setValue(`${fieldPath}.city`, data.localidade || "", {
              shouldValidate: true,
            });
            setValue(`${fieldPath}.state`, data.uf || "", {
              shouldValidate: true,
            });
            setValue(`${fieldPath}.country`, "Brasil", {
              shouldValidate: true,
            });
          } else {
            console.log(`CEP ${cleanedCep} não encontrado`);
          }
        })
        .catch((err) =>
          console.error(`Erro ao consultar CEP ${cleanedCep}:`, err)
        );
    },
    [setValue]
  );

  const createAuth0User = useCallback(async () => {
    const token = await ensureManagementToken();
    const primaryEmail = getValues("emails").find((e) => e.is_main)?.email;
    if (!primaryEmail) throw new Error("E-mail principal é necessário");
    const payload = {
      email: primaryEmail,
      email_verified: false,
      password: "TempPass123!",
      name: getValues("name"),
      nickname: getValues("nickname"),
      picture: getValues("picture"),
      connection: "Username-Password-Authentication",
    };
    const response = await stableRequest(`/api/v2/users`, {
      method: "POST",
      data: payload,
      baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
      token,
    });
    await stableRequest(`/dbconnections/change_password`, {
      method: "POST",
      baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
      data: {
        client_id: auth0ClientId,
        email: primaryEmail,
        connection: "Username-Password-Authentication",
      },
    });
    return response.user_id;
  }, [stableRequest, auth0ClientId, ensureManagementToken, getValues]);

  const updateAuth0User = useCallback(
    async (sub) => {
      const token = await ensureManagementToken();
      const auth0MappedUser = mapFormUserToAuth0User(getValues());
      await stableRequest(`/api/v2/users/${sub}`, {
        method: "PATCH",
        data: auth0MappedUser,
        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
        token,
      });
    },
    [stableRequest, ensureManagementToken, getValues]
  );

  const onSubmit = useCallback(
    async (data) => {
      try {
        console.log("Dados brutos do formulário antes do envio:", data);
        const dbMappedUser = mapFormUserToDbUser(data);
        let response;
        if (mode === "create") {
          dbMappedUser.sub = await createAuth0User();
          response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbMappedUser),
          });
        } else if (mode === "edit") {
          await updateAuth0User(data.sub);
          response = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dbMappedUser),
          });
        }
        if (!response.ok) {
          const errorData = await response.json();
          console.log("Resposta de erro do backend:", errorData);
          throw new Error(
            errorData.error || "Erro ao salvar usuário no backend"
          );
        }
        alert("Formulário salvo com sucesso!");
        reset(defaultValues);
      } catch (err) {
        console.error("Erro ao salvar:", err);
        //alert(`Erro ao salvar o formulário: ${err.message}`);
        console.log("Estado do formulário após o erro:", getValues());
      }
    },
    [mode, createAuth0User, updateAuth0User, reset, defaultValues]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="pl-4 pt-5 pb-10 bg-gray-100 border-b border-r border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2 ">
          <FaEdit className="w-8 h-8 text-blue-500" />
          <div>
            <h1 className="text-xl font-bold">
              {mode === "create" ? "Criando usuário" : "Alterando usuário"}
            </h1>
            <p className="text-sm text-gray-600">
              Preencha os dados abaixo para{" "}
              {mode === "create" ? "criar" : "alterar"} o perfil
            </p>
          </div>
        </div>
      </header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <main className="pl-2 pr-2 pb-2 pt-12 sm:pl-4 sm:pr-4 sm:pb-4 md:pl-6 md:pr-6 md:pb-6 mb-14 flex-1">
          <section className="mb-14">
            <h2 className="flex items-center text-lg font-semibold mb-2">
              <MdPerson className="w-6 h-6 mr-2" /> Informações Pessoais
            </h2>
            <div className="pt-2 space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium">Foto</label>
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    {getValues("picture") ? (
                      <CustomImage
                        src={getValues("picture")}
                        alt="Foto do usuário"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaImage className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  {errors.picture && (
                    <span className="text-red-500 text-sm">
                      {errors.picture.message}
                    </span>
                  )}
                </div>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Nome"
                      {...field}
                      disabled={mode === "view"}
                      error={errors.name?.message}
                      className="w-full md:w-2/3"
                    />
                  )}
                />
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Apelido"
                      {...field}
                      disabled={mode === "view"}
                      error={errors.nickname?.message}
                      className="w-full md:w-1/3"
                    />
                  )}
                />
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Data de Nascimento"
                      type="date"
                      {...field}
                      disabled={mode === "view"}
                      error={errors.birth_date?.message}
                      className="w-full md:w-fit"
                    />
                  )}
                />
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="CPF"
                      {...field}
                      onChange={(e) =>
                        setValue("cpf", applyCPFMask(e.target.value), {
                          shouldValidate: true,
                        })
                      }
                      disabled={mode === "view"}
                      maxLength={14}
                      error={errors.cpf?.message}
                      className="w-full md:w-fit"
                    />
                  )}
                />
              </div>
            </div>
          </section>

          <div className="space-y-14">
            <SubForm
              title="Endereços"
              icon={FaMapMarkerAlt}
              fields={[
                {
                  name: "zip_code",
                  label: "CEP",
                  type: "number",
                  onChange: (e, fieldPath) =>
                    fetchAddressByCep(e.target.value, fieldPath),
                },
                { name: "street", label: "Rua/Avenida" },
                { name: "number", label: "Número", type: "number" },
                { name: "complement", label: "Complemento" },
                { name: "district", label: "Bairro" },
                { name: "city", label: "Cidade" },
                { name: "state", label: "Estado" },
                { name: "country", label: "País" },
              ]}
              schema={userSchema.fields.addresses.innerType}
              control={control}
              trigger={trigger}
              setValue={setValue}
              getValues={getValues}
              setError={setError}
              clearErrors={clearErrors}
              name="addresses"
              errors={errors.addresses?.message}
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
              schema={userSchema.fields.emails.innerType}
              control={control}
              trigger={trigger}
              setValue={setValue}
              getValues={getValues}
              setError={setError}
              clearErrors={clearErrors}
              name="emails"
              errors={errors.emails?.message}
              width="md:w-[35rem]"
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
                  onChange: (e, fieldPath) =>
                    setValue(
                      `${fieldPath}.telephone`,
                      applyTelephoneMask(e.target.value),
                      { shouldValidate: true }
                    ),
                },
              ]}
              schema={userSchema.fields.telephones.innerType}
              control={control}
              trigger={trigger}
              setValue={setValue}
              getValues={getValues}
              setError={setError}
              clearErrors={clearErrors}
              name="telephones"
              errors={errors.telephones?.message}
              width="md:w-[35rem]"
            />
            <section className="bg-gray-50 p-4 rounded-md">
              <div className="flex items-center text-lg font-semibold mb-2">
                <FaLock className="w-5 h-5 mr-2" /> Senha
              </div>
              <div className="pt-2">
                {mode === "create" && (
                  <p className="text-sm text-gray-600">
                    Uma senha temporária será gerada e um email de redefinição
                    será enviado ao usuário.
                  </p>
                )}
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() =>
                      stableRequest(`/dbconnections/change_password`, {
                        method: "POST",
                        baseUrl: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}`,
                        data: {
                          client_id: auth0ClientId,
                          email: getValues("emails").find((e) => e.is_main)
                            ?.email,
                          connection: "Username-Password-Authentication",
                        },
                      })
                    }
                    className="px-4 py-2"
                  >
                    Enviar Email de Redefinição de Senha
                  </Button>
                )}
              </div>
            </section>
          </div>
        </main>

        {mode !== "view" && (
          <footer className="pl-4 pb-5 pt-10 bg-gray-100 flex gap-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => reset(defaultValues)}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="px-4 py-2">
              Salvar
            </Button>
          </footer>
        )}
      </Form>
    </div>
  );
}
