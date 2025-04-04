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
import Form from "@/frontend/components/form/Form";
import CustomInput from "@/frontend/components/form/input/CustomInput";
import { FaMapMarkerAlt, FaEnvelope, FaPhone } from "react-icons/fa";
import { MdPerson, MdLock, MdEdit } from "react-icons/md";
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
import { useRouter } from "next/navigation";
import { EditIcon } from "lucide-react";

export default function UserForm({ userId }) {
  const router = useRouter();
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
      password_confirmation: "",
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
    context: { isCreateMode: mode === "create" },
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
          success: (msg) => msg,
          error: (err) => err.message,
        }
      );
    },
    [setValue]
  );

  const onSubmit = useCallback(
    async (data) => {
      let tempFileId = null;
      let operationSuccess = false;

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
        return true;
      } catch (err) {
        if (tempFileId) {
          await fetch("/api/img/delete-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fileId: tempFileId }),
          }).catch(console.error);
        }

        toast.error(`Erro: ${err.message}`);
        return false;
      } finally {
        dispatch(setIsSubmitting(false));
      }
    },
    [request, userId, setValue, dispatch]
  );

  const handleAction = async (action) => {
    try {
      const isValid = await trigger();
      if (!isValid) throw new Error("Formulário inválido");

      const formData = getValues();
      const success = await onSubmit(formData);

      if (success && action) {
        if (action === "new") {
          reset(defaultValues);
          window.location.href = "/user/register";
        } else if (action === "close") {
          window.history.back();
        }
      }

      return success;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleSave = () => handleAction();
  const handleSaveAndNew = () => handleAction("new");
  const handleSaveAndClose = () => handleAction("close");
  const handleCancel = () => window.history.back();
  const handleClear = () => reset(defaultValues);

  return (
    <div className="flex p-5 flex-col min-h-screen bg-system-background-form dark:bg-dark-background-form">
      <header className="pt-5 pb-5 border-b border-system-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <EditIcon className="w-16 h-16 text-system-primary dark:text-dark-primary" />
          <div>
            <h1 className="text-[35px] text-system-text dark:text-dark-text">
              {mode === "create" ? "Criando usuário" : "Alterando usuário"}
            </h1>
            <p className="text-sm text-system-muted dark:text-dark-muted">
              Preencha os dados abaixo para{" "}
              {mode === "create" ? "criar" : "alterar"} o perfil
            </p>
          </div>
        </div>
      </header>

      <Form
        onSubmit={handleSubmit(onSubmit)}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onSaveAndClose={handleSaveAndClose}
        onCancel={handleCancel}
        onClear={handleClear}
        showDefaultButtons={mode !== "view"}
      >
        <main className="pb-2 pt-12 sm:pb-4 md:pb-6 mb-14 flex-1">
          <section className="mb-14">
            <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-system-text dark:text-dark-text border-b border-system-border dark:border-dark-border">
              <MdPerson className="w-7 h-7 text-system-primary dark:text-dark-primary" />
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
                      className="w-full md:w-[25rem]"
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
                      className="w-full md:md:w-[25rem]"
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
                      className="w-full md:md:w-[10rem]"
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
                      className="w-full md:md:w-[10rem]"
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {mode === "create" && (
            <section className="mb-14">
              <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-system-text dark:text-dark-text border-b border-system-border dark:border-dark-border">
                <MdLock className="w-7 h-7 text-system-primary dark:text-dark-primary" />
                Segurança
              </h2>
              <div className="space-y-6 mt-2">
                <div className="flex flex-col gap-4">
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
                        placeholder="Digite sua senha"
                        className="w-[15rem]"
                      />
                    )}
                  />
                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        label="Confirmação de Senha"
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                        error={errors.password_confirmation?.message}
                        placeholder="Confirme sua senha"
                        className="w-[15rem]"
                      />
                    )}
                  />
                </div>
              </div>
            </section>
          )}

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
      </Form>
    </div>
  );
}
