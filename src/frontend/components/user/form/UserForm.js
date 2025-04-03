"use client";
import { useEffect, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  setFormData,
  setPreviewImage,
  setMode,
  setIsFetched,
  setIsSubmitting,
  resetForm,
} from "@/lib/features/user/userFormSlice";
import Button from "@/frontend/components/form/button/CustomButton";
import Form from "@/frontend/components/form/Form";
import CustomInput from "@/frontend/components/form/input/CustomInput";
import { FaEdit, FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { MdPerson } from "react-icons/md";
import SubForm from "@/frontend/components/form/subForm/SubForm";
import PhotoField from "@/frontend/components/form/image/PhotoField";
import useRequest from "@/frontend/hooks/useRequest";

import {
  applyCPFMask,
  applyTelephoneMask,
} from "@/shared/businnes/rules/generalRules";
import { userSchema } from "@/shared/businnes/schemas/userSchema";
import UserService from "@/frontend/services/userService";
import { mapApiUserToFormUser } from "@/frontend/businnes/mappers/userMapper";

export default function UserForm({ userId }) {
  const dispatch = useDispatch();
  const { formData, previewImage, mode, isFetched, isSubmitting } = useSelector(
    (state) => state.userForm
  );

  const { request } = useRequest();
  const defaultValues = useMemo(
    () => ({
      name: "",
      nickname: "",
      picture: null,
      birth_date: "",
      cpf: "",
      password: "",
      addresses: [],
      emails: [],
      telephones: [],
    }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    getValues,
    reset,
    trigger,
    setError,
    clearErrors,
  } = useForm({
    resolver: yupResolver(userSchema),
    defaultValues: formData,
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const fetchUserDataHandler = useCallback(async () => {
    try {
      const res = await request(
        `/api/user/${userId}?address=true&email=true&telephone=true`
      );
      if (!res.ok) throw new Error("Erro ao buscar usuário");

      const mappedUser = mapApiUserToFormUser(res.data);

      dispatch(setFormData(mappedUser));
      reset(mappedUser);
      dispatch(setPreviewImage(mappedUser.picture));
      dispatch(setIsFetched(true));
      toast.success("Dados do usuário carregados com sucesso!");
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      setError("root", { message: err.message });
      toast.error(`Erro ao carregar usuário: ${err.message}`);
    }
  }, [userId, request, reset, dispatch, setError]);

  useEffect(() => {
    const currentFormId = userId ? `user-${userId}` : "user-create";

    if (!isFetched) {
      if (userId && mode !== "edit") {
        dispatch(setMode("edit"));
        fetchUserDataHandler();
      } else if (!userId && mode !== "create") {
        dispatch(setMode("create"));
        reset(defaultValues);
        dispatch(resetForm({ formId: currentFormId, mode: "create" }));
      }
    }
  }, [
    userId,
    fetchUserDataHandler,
    isFetched,
    mode,
    dispatch,
    reset,
    defaultValues,
  ]);

  useEffect(() => {
    console.log("Erros atuais do formulário:", errors);
  }, [errors]);

  const fetchAddressByCep = useCallback(
    (cep, fieldPath) => {
      const cleanedCep = String(cep).replace(/\D/g, "");
      if (cleanedCep.length !== 8) return;

      toast.promise(
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
              return "Endereço preenchido automaticamente!";
            } else {
              throw new Error(`CEP ${cleanedCep} não encontrado`);
            }
          }),
        {
          loading: "Buscando endereço...",
          ok: (msg) => msg,
          error: (err) => err.message,
        }
      );
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data) => {
      let tempFileId = null;

      console.log("onSubmit chamado com dados:", data);

      try {
        dispatch(setIsSubmitting(true));

        if (data.picture instanceof File) {
          const uploadFormData = new FormData();
          uploadFormData.append("file", data.picture);

          const uploadResponse = await fetch("/api/img/upload", {
            method: "POST",
            body: uploadFormData,
          });

          const uploadData = await uploadResponse.json();
          if (!uploadResponse.ok || !uploadData?.ok) {
            throw new Error(
              uploadData?.message || "Falha no upload temporário"
            );
          }

          tempFileId = uploadData.fileId;
        }

        const response = await new UserService(request).submitUserForm(
          {
            ...data,
            picture: tempFileId || data.picture,
          },
          userId
        );

        if (!response?.ok) {
          throw new Error(response?.message || "Erro ao salvar usuário");
        }

        if (tempFileId) {
          const confirmResponse = await fetch("/api/img/confirm-upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: tempFileId }),
          });

          const confirmData = await confirmResponse.json();
          if (!confirmResponse.ok || !confirmData?.ok) {
            throw new Error(
              confirmData?.message || "Falha ao confirmar upload"
            );
          }

          setValue("picture", confirmData.url);
          dispatch(setPreviewImage(confirmData.url));
        }

        toast.success("Usuário salvo com sucesso!");
      } catch (err) {
        if (tempFileId) {
          await fetch("/api/img/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: tempFileId }),
          }).catch(console.error);
        }

        toast.error(`Erro: ${err.message}`);
      } finally {
        dispatch(setIsSubmitting(false));
      }
    },
    [request, userId, setValue, dispatch]
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="pl-4 pt-5 pb-10 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border-b border-r border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <FaEdit className="w-8 h-8 text-light-primary dark:text-dark-primary" />
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
            <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
              <MdPerson className="w-7 h-7 text-light-primary dark:text-dark-primary" />
              Informações Pessoais
            </h2>
            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-1 gap-4">
                <PhotoField
                  control={control}
                  name="picture"
                  trigger={trigger}
                  disabled={mode === "view" || isSubmitting}
                  defaultValue={userId ? getValues("picture") : null}
                  label="Foto"
                />
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Nome"
                      {...field}
                      disabled={mode === "view" || isSubmitting}
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
                      disabled={mode === "view" || isSubmitting}
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
                      disabled={mode === "view" || isSubmitting}
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
                      disabled={mode === "view" || isSubmitting}
                      maxLength={14}
                      error={errors.cpf?.message}
                      className="w-full md:w-fit"
                    />
                  )}
                />
                {mode === "create" && (
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        label="Senha"
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                        error={errors.password?.message}
                        className="w-full md:w-1/3"
                      />
                    )}
                  />
                )}
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
              isSubmitting={isSubmitting}
            />
            <SubForm
              title="E-mails"
              icon={FaEnvelope}
              fields={[
                { name: "email", label: "E-mail" },
                {
                  name: "email_verified",
                  label: "Email Verificado?",
                  type: "date",
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
              isSubmitting={isSubmitting}
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
              isSubmitting={isSubmitting}
            />
          </div>
        </main>

        {mode !== "view" && (
          <footer className="pl-4 pb-5 pt-10 flex gap-4 bg-light-background-form-secondary dark:bg-dark-background-form-secondary border-t border-light-border dark:border-dark-border">
            <Button
              type="button"
              variant={"secondary"}
              onClick={() => window.history.back()}
              className="px-4 py-2"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="px-4 py-2"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              onSubmit={(e) => {
                console.log("Form submitted");
                handleSubmit(onSubmit)(e).catch((err) => {
                  console.error("Submission error:", err);
                });
              }}
            >
              {isSubmitting ? (
                <>{userId ? "Atualizando..." : "Cadastrando..."}</>
              ) : (
                "Salvar"
              )}
            </Button>
          </footer>
        )}
      </Form>
    </div>
  );
}
