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
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaRegEdit,
  FaUserAlt,
} from "react-icons/fa";
import { MdLock } from "react-icons/md";
import SubForm from "@/frontend/components/form/subForm/SubForm";
import PhotoField from "@/frontend/components/form/image/PhotoField";
import useRequest from "@/frontend/hooks/useRequest";
import {
  applyCPFMask,
  applyTelephoneMask,
} from "@/shared/businnes/rules/generalRules";
import { userSchema } from "@/shared/businnes/schemas/userSchema";

import { useUserApi } from "@/frontend/api/userApi";
import { useImageApi } from "@/frontend/api/imageApi";
import { useGeneralApi } from "@/frontend/api/generalApi";
import { useRouter } from "next/navigation";
import UserService from "@/frontend/services/userService";

export default function UserForm({ userId }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const { formData, previewImage, mode, isFetched, isSubmitting } = useSelector(
    (state) => state.userForm
  );

  const { request } = useRequest();
  const { fetchUser } = useUserApi(request);
  const imageApi = useImageApi(request);
  const { fetchAddressByCep } = useGeneralApi(request);

  // Inicializa o serviço de usuário com a API de imagem
  const userService = useMemo(() => {
    const service = new UserService(request);
    service.setImageApi(imageApi);
    return service;
  }, [request, imageApi]);

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

  /**
   * Busca os dados do usuário e atualiza o formulário
   * @returns {Promise<void>}
   */
  const fetchUserDataHandler = useCallback(async () => {
    try {
      // Busca os dados do usuário
      const mappedUser = await fetchUser(userId);

      if (!mappedUser) {
        throw new Error(`Usuário com ID ${userId} não encontrado`);
      }

      // Atualiza o estado do formulário
      dispatch(setFormData(mappedUser));
      reset(mappedUser);
      dispatch(setPreviewImage(mappedUser.picture));
      dispatch(setIsFetched(true));

      toast.success("Dados do usuário carregados com sucesso!");
    } catch (err) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = err.message || "Erro desconhecido";
      console.error(
        `Erro ao buscar usuário (ID: ${userId}):`,
        errorMessage,
        err
      );

      // Define o erro no formulário
      setError("root", {
        type: "fetchError",
        message: `Falha ao carregar dados do usuário: ${errorMessage}`,
      });

      // Notifica o usuário
      toast.error(`Erro ao carregar usuário: ${errorMessage}`);

      // Marca como buscado mesmo com erro para evitar loops infinitos
      dispatch(setIsFetched(true));
    }
  }, [userId, fetchUser, reset, dispatch, setError]);

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
  }, [userId, isFetched]);

  /**
   * Busca um endereço pelo CEP e preenche os campos do formulário
   * @param {string} cep - CEP a ser consultado
   * @param {string} fieldPath - Caminho do campo no formulário
   * @returns {Promise<void>}
   */
  const fetchAddressHandler = useCallback(
    async (cep, fieldPath) => {
      const cleanedCep = cep.replace(/\D/g, "");

      if (cleanedCep.length !== 8) {
        // CEP incompleto, não faz nada
        console.log(`CEP incompleto: ${cleanedCep}`);
        return;
      }

      console.log(`Buscando endereço para o CEP: ${cleanedCep}`);
      console.log(`Campo path: ${fieldPath}`);

      try {
        // Busca o endereço pelo CEP
        const data = await fetchAddressByCep(cleanedCep);

        // Log dos dados recebidos
        console.log("Dados do endereço recebidos:", data);

        if (!data) {
          console.error(
            `Dados do endereço não encontrados para o CEP ${cleanedCep}`
          );
          throw new Error(`CEP ${cleanedCep} não encontrado`);
        }

        // Extrai o índice do campo de endereço
        const pathParts = fieldPath.split(".");
        const addressIndex = parseInt(pathParts[1], 10);

        // Cria um objeto com os novos valores
        const updatedAddress = {
          zip_code: cleanedCep,
          street: data.logradouro || "",
          district: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
          country: "Brasil",
        };

        console.log("Novo objeto de endereço:", updatedAddress);

        // Método 1: Atualiza o modelo de dados
        // Obtém os valores atuais do endereço para preservar outros campos
        const currentAddressValues = getValues(`addresses.${addressIndex}`);
        console.log("Valores atuais do endereço:", currentAddressValues);

        // Mescla os valores atuais com os novos valores
        const mergedAddress = {
          ...currentAddressValues,
          ...updatedAddress,
        };

        // Atualiza o endereço completo de uma vez no modelo de dados
        setValue(`addresses.${addressIndex}`, mergedAddress, {
          shouldValidate: true,
          shouldDirty: true,
        });

        // Força a atualização do formulário
        trigger(`addresses.${addressIndex}`);

        // Verifica se os campos foram atualizados no modelo
        const updatedValues = getValues(`addresses.${addressIndex}`);
        console.log("Valores atualizados no modelo:", updatedValues);

        toast.success("Endereço preenchido automaticamente!");
      } catch (error) {
        // Melhora a mensagem de erro para facilitar o debugging
        const errorMessage = error.message || "Erro desconhecido";
        console.error(
          `Erro ao buscar endereço para o CEP ${cleanedCep}:`,
          errorMessage,
          error
        );

        // Define o erro no campo específico
        setError(`${fieldPath}.zip_code`, {
          type: "cepError",
          message: "CEP inválido ou não encontrado",
        });

        // Notifica o usuário
        toast.error(`Erro ao buscar CEP: ${errorMessage}`);
      }
    },
    [fetchAddressByCep, setValue, getValues, setError, trigger]
  );

  /**
   * Envia os dados do formulário para o servidor
   * @param {Object} data - Dados do formulário
   * @returns {Promise<boolean>} true se o envio foi bem-sucedido, false caso contrário
   */
  const onSubmit = useCallback(
    async (data) => {
      try {
        // Inicia o processo de envio
        dispatch(setIsSubmitting(true));

        // Função para atualizar a imagem no estado após confirmação
        const updateImageCallback = (imageUrl) => {
          setValue("picture", imageUrl);
          dispatch(setPreviewImage(imageUrl));
        };

        // Processa o envio do formulário com imagem
        const result = await userService.processUserFormWithImage(
          data,
          userId,
          updateImageCallback
        );

        // Verifica se há avisos
        if (result.warning) {
          toast.warning(result.warning);
        } else {
          toast.success("Usuário salvo com sucesso!");
        }

        return true;
      } catch (err) {
        // Melhora a mensagem de erro para facilitar o debugging
        const errorMessage = err.message || "Erro desconhecido";
        console.error(
          `Erro ao ${userId ? "atualizar" : "criar"} usuário:`,
          errorMessage,
          err
        );

        // Verifica se é um erro específico de upload de imagem
        if (errorMessage.includes("imagem")) {
          setError("picture", {
            type: "uploadError",
            message: "Falha ao enviar imagem. Tente novamente.",
          });
        } else {
          // Define o erro no formulário
          setError("root", {
            type: "submitError",
            message: `Falha ao salvar usuário: ${errorMessage}`,
          });
        }

        // Notifica o usuário
        toast.error(`Erro: ${errorMessage}`);
        return false;
      } finally {
        dispatch(setIsSubmitting(false));
      }
    },
    [userService, userId, setValue, setError, dispatch]
  );

  /**
   * Executa uma ação após validar e enviar o formulário
   * @param {string|undefined} action - Ação a ser executada após o envio ("new", "close" ou undefined)
   * @returns {Promise<boolean>} true se a ação foi bem-sucedida, false caso contrário
   */
  const handleAction = async (action) => {
    try {
      // Valida o formulário
      const isValid = await trigger();

      if (!isValid) {
        // Se o formulário não for válido, mostra uma mensagem mais específica
        const firstError = Object.entries(errors).find(([_, value]) => value);
        const errorField = firstError ? firstError[0] : "";
        const errorMessage = firstError
          ? firstError[1].message
          : "Formulário inválido";

        throw new Error(
          `Erro de validação${errorField ? ` no campo ${errorField}` : ""}: ${errorMessage}`
        );
      }

      // Obtém os dados do formulário e envia
      const formData = getValues();
      const success = await onSubmit(formData);

      // Se o envio foi bem-sucedido e há uma ação a ser executada
      if (success && action) {
        if (action === "new") {
          // Limpa o formulário e redireciona para a página de criação
          reset(defaultValues);
          window.location.href = "/user/register";
        } else if (action === "close") {
          // Volta para a página anterior
          window.history.back();
        }
      }

      return success;
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = error.message || "Erro desconhecido";
      console.error(
        "Erro ao processar ação do formulário:",
        errorMessage,
        error
      );

      // Notifica o usuário
      toast.error(errorMessage);
      return false;
    }
  };

  const handleSave = () => handleAction();
  const handleSaveAndNew = () => handleAction("new");
  const handleSaveAndClose = () => handleAction("close");
  const handleCancel = () => window.history.back();
  const handleClear = () => reset(defaultValues);

  return (
    <div className="flex p-2 md:p-12 flex-col min-h-screen bg-light-background-form dark:bg-dark-background-form border border-light-border dark:border-dark-border shadow-xl">
      <header className="pb-5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <FaRegEdit className="w-8 h-8 text-light-primary dark:text-dark-primary" />
          <div className="flex flex-col">
            <h1 className="text-[30px] text-light-text dark:text-dark-text">
              {mode === "create" ? "Criando usuário" : "Alterando usuário"}
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
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
            <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
              <FaUserAlt className="w-5 h-5 text-light-primary dark:text-dark-primary" />
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
              <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
                <MdLock className="w-7 h-7 text-light-primary dark:text-dark-primary" />
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
                  onChange: (e, fieldPath) => {
                    // Remove não-dígitos e limita a 8 caracteres
                    const cleanedValue = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 8);
                    setValue(`${fieldPath}.zip_code`, cleanedValue);

                    // Só consulta quando tiver 8 dígitos exatos
                    if (cleanedValue.length === 8) {
                      fetchAddressHandler(cleanedValue, fieldPath);
                    }
                  },
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
