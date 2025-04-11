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
  setIsFetched, // Actions são necessárias
  setIsSubmitting,
  resetForm, // Se você usar esta action
} from "@/lib/features/user/userFormSlice"; // Ajuste o caminho se necessário
import Form from "@/frontend/components/form/Form"; // Ajuste o caminho
import CustomInput from "@/frontend/components/form/input/CustomInput"; // Ajuste o caminho
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
  FaRegEdit,
  FaUserAlt,
  FaEye,
} from "react-icons/fa";
import { MdLock } from "react-icons/md";
import SubForm from "@/frontend/components/form/subForm/SubForm"; // Ajuste o caminho
import PhotoField from "@/frontend/components/form/image/PhotoField"; // Ajuste o caminho
import useRequest from "@/frontend/hooks/useRequest"; // Ajuste o caminho
import {
  applyCPFMask,
  applyTelephoneMask,
} from "@/shared/businnes/rules/generalRules"; // Ajuste o caminho
import { userSchema } from "@/shared/businnes/schemas/userSchema"; // Ajuste o caminho

// Hooks de API e Serviço (ajuste os caminhos)
import { useUserApi } from "@/frontend/api/userApi";
import { useImageApi } from "@/frontend/api/imageApi";
import { useGeneralApi } from "@/frontend/api/generalApi";
import UserService from "@/frontend/services/userService";

export default function UserForm({ userId, initialMode = "create" }) {
  const dispatch = useDispatch();
  // Lê o estado atual do Redux
  const { formData, previewImage, mode, isFetched, isSubmitting } = useSelector(
    (state) => state.userForm
  );

  // Inicializa hooks de API e serviço
  const { request } = useRequest();
  // Garanta que os hooks usem useCallback internamente para retornar funções estáveis
  const { fetchUser } = useUserApi(request);
  const imageApi = useImageApi(request);
  const { fetchAddressByCep } = useGeneralApi(request);

  const userService = useMemo(() => {
    const service = new UserService(request);
    service.setImageApi(imageApi);
    return service;
  }, [request, imageApi]); // Dependências estáveis

  // Valores padrão para o formulário RHF
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

  // Configuração do React Hook Form
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
    resolver: yupResolver(userSchema), // Usa Yup para validação
    defaultValues: defaultValues, // Começa com valores padrão
    mode: "onChange", // Valida ao mudar
    reValidateMode: "onChange", // Revalida ao mudar
    // Contexto inicial, pode ser usado pelo schema
    context: { isCreateMode: initialMode === "create" },
  });

  // Função para buscar os dados do usuário (envolvida em useCallback)
  const fetchUserDataHandler = useCallback(async () => {
    // Só busca se estiver em modo edit/view e tiver userId
    if (!userId || (mode !== "edit" && mode !== "view")) {
      console.log(
        "fetchUserDataHandler: Skipping fetch - No userId or incorrect mode.",
        { userId, mode }
      );
      return;
    }
    console.log(
      `FETCH_HANDLER: Attempting fetch for user ${userId} (Mode: ${mode}) - Instance Firing`
    );
    try {
      const mappedUser = await fetchUser(userId); // Chama a API
      console.log("FETCH_HANDLER: User data fetched:", mappedUser);
      if (!mappedUser)
        throw new Error(
          `Usuário com ID ${userId} não encontrado ou dados nulos`
        );

      // Atualiza o estado Redux
      dispatch(setFormData(mappedUser));
      dispatch(setPreviewImage(mappedUser.picture));

      // Atualiza o estado do React Hook Form com os dados buscados
      console.log("FETCH_HANDLER: Calling reset with mappedUser:", mappedUser);
      reset(mappedUser);
      console.log("FETCH_HANDLER: reset function called.");

      // Marca no Redux que a busca foi concluída (com sucesso)
      dispatch(setIsFetched(true));

      if (mode === "edit")
        toast.success("Dados do usuário carregados com sucesso!");
    } catch (err) {
      const errorMessage = err.message || "Erro desconhecido";
      console.error("FETCH_HANDLER: Error during fetch:", err);
      setError("root", {
        type: "fetchError",
        message: `Falha ao carregar dados do usuário: ${errorMessage}`,
      });
      toast.error(`Erro ao carregar usuário: ${errorMessage}`);
      // Marca como tentado mesmo em erro, para evitar loops no Effect 2
      dispatch(setIsFetched(true));
    }
    // Dependências estáveis para useCallback
  }, [
    userId,
    mode,
    fetchUser,
    reset,
    dispatch,
    setError,
    setFormData,
    setPreviewImage,
    setIsFetched,
  ]);

  // --- Effect 1: Define modo Redux e Reseta Status Fetch SOMENTE NA MONTAGEM/MUDANÇA DE PROPS ---
  // Roda quando o componente é montado (garantido pela 'key' no pai) ou se as props mudarem.
  useEffect(() => {
    console.log(
      `Effect 1 (Mount/Key Change) - Setting initial state for UserID: ${userId}, InitialMode: ${initialMode}`
    );

    // Reseta isFetched para false, preparando para a lógica de busca do Effect 2
    dispatch(setIsFetched(false));
    console.log(`Effect 1: Dispatched setIsFetched(false).`);

    // Define o modo Redux com base na prop recebida por esta instância
    console.log(`Effect 1: Dispatching setMode('${initialMode}').`);
    dispatch(setMode(initialMode));

    // **** DEPENDÊNCIAS CORRIGIDAS PARA EVITAR LOOP ****
    // Depende apenas das props que definem o contexto inicial e das funções estáveis.
  }, [userId, initialMode, dispatch, setMode, setIsFetched]);
  // **** FIM DAS DEPENDÊNCIAS CORRIGIDAS ****

  // --- Effect 2: Dispara busca ou reset baseado no MODO ATUAL e status ISFETCHED ---
  // Roda após o Effect 1 e sempre que suas dependências mudarem.
  useEffect(() => {
    // Lê o estado atualizado (mode e isFetched podem ter sido alterados pelo Effect 1 ou fetchUserDataHandler)
    console.log(
      `Effect 2: Evaluating action. Mode: ${mode}, UserID: ${userId}, isFetched: ${isFetched}`
    );
    const shouldFetch = (mode === "edit" || mode === "view") && userId;
    const shouldResetToCreate = mode === "create" && !userId; // Modo criação

    if (shouldFetch) {
      // A condição !isFetched será true na montagem inicial (após Effect 1)
      if (!isFetched) {
        console.log(
          "Effect 2: Needs fetch (isFetched is false) - calling fetchUserDataHandler."
        );
        fetchUserDataHandler(); // Dispara a busca
      } else {
        // Após a busca, isFetched vira true, e este log será mostrado em re-renderizações subsequentes.
        console.log(
          "Effect 2: Fetch already completed or in progress (isFetched is true)."
        );
      }
    } else if (shouldResetToCreate) {
      // Se o form for montado no modo 'create' sem userId
      console.log(
        "Effect 2: Mode 'create' and no userId. Resetting form to default values."
      );
      reset(defaultValues); // Garante reset explícito do RHF
      dispatch(setPreviewImage(null)); // Limpa imagem preview
      console.log(
        "Effect 2: RHF reset to defaultValues and preview image cleared."
      );
      // Garante que isFetched seja false (embora Effect 1 já deva ter feito)
      if (isFetched) dispatch(setIsFetched(false));
    } else {
      // Outros casos (ex: modo edit sem userId, que já deve ser tratado na página pai)
      console.log(
        `Effect 2: No fetch/reset needed for this state (Mode: ${mode}, UserID: ${userId}, Fetched: ${isFetched})`
      );
    }
    // Depende do estado atual (mode, isFetched, userId) e das funções que chama/usa
  }, [
    mode,
    userId,
    isFetched,
    reset,
    dispatch,
    defaultValues,
    fetchUserDataHandler,
    setPreviewImage,
    setMode,
    setIsFetched,
  ]);

  // --- Fetch Address Handler --- (Função para buscar endereço pelo CEP)
  const fetchAddressHandler = useCallback(
    async (cep, fieldPath) => {
      if (mode === "view") return; // Não busca em modo visualização
      const cleanedCep = cep.replace(/\D/g, "");
      if (cleanedCep.length !== 8) return; // CEP inválido
      console.log(
        `Fetching address for CEP: ${cleanedCep}, Path: ${fieldPath}`
      );
      try {
        const data = await fetchAddressByCep(cleanedCep); // Chama API de CEP
        if (!data || !data.logradouro) {
          // Verifica se a resposta é válida
          setError(`${fieldPath}.zip_code`, {
            type: "custom",
            message: "CEP não encontrado ou inválido.",
          });
          throw new Error(
            `CEP ${cleanedCep} não encontrado ou dados incompletos`
          );
        }
        clearErrors(`${fieldPath}.zip_code`); // Limpa erro anterior do CEP

        // Atualiza os campos do endereço no React Hook Form
        const pathParts = fieldPath.split("."); // Ex: "addresses.0"
        const addressIndex = parseInt(pathParts[1], 10);
        setValue(`addresses.${addressIndex}.street`, data.logradouro || "", {
          shouldDirty: true,
        });
        setValue(`addresses.${addressIndex}.district`, data.bairro || "", {
          shouldDirty: true,
        });
        setValue(`addresses.${addressIndex}.city`, data.localidade || "", {
          shouldDirty: true,
        });
        setValue(`addresses.${addressIndex}.state`, data.uf || "", {
          shouldDirty: true,
        });
        setValue(`addresses.${addressIndex}.country`, "Brasil", {
          shouldDirty: true,
        }); // Assume Brasil
        trigger(`addresses.${addressIndex}`); // Opcional: dispara validação do subform
        toast.success("Endereço preenchido automaticamente!");
      } catch (error) {
        const errorMessage = error.message || "Erro desconhecido";
        console.error(
          `Erro ao buscar endereço para o CEP ${cleanedCep}:`,
          errorMessage,
          error
        );
        // Garante que o erro seja setado no campo CEP se ainda não estiver
        if (
          !errors[fieldPath.split(".")[0]]?.[
            parseInt(fieldPath.split(".")[1], 10)
          ]?.zip_code
        ) {
          setError(`${fieldPath}.zip_code`, {
            type: "cepError",
            message: "CEP inválido ou erro na busca",
          });
        }
        toast.error(`Erro ao buscar CEP: ${errorMessage}`);
      }
      // Dependências do useCallback
    },
    [mode, fetchAddressByCep, setValue, trigger, setError, clearErrors, errors]
  );

  // --- On Submit Handler --- (Função chamada ao submeter o formulário RHF)
  const onSubmit = useCallback(
    async (data) => {
      if (mode === "view") return false; // Não submete em modo visualização
      dispatch(setIsSubmitting(true)); // Ativa estado de 'submitting'
      let success = false; // Flag de sucesso
      try {
        // Callback para atualizar a URL da imagem se uma nova for enviada
        const updateImageCallback = (imageUrl) => {
          setValue("picture", imageUrl, { shouldDirty: true });
          dispatch(setPreviewImage(imageUrl));
        };
        // Chama o serviço para processar o formulário (criar ou atualizar)
        const result = await userService.processUserFormWithImage(
          data,
          userId,
          updateImageCallback
        );

        if (result.warning) toast.warning(result.warning);
        else
          toast.success(
            `Usuário ${userId ? "atualizado" : "criado"} com sucesso!`
          );

        // IMPORTANTE: Resetar isFetched após save bem sucedido
        // Permite re-fetch se necessário ou simplesmente limpa o status.
        dispatch(setIsFetched(false));
        success = true; // Marca como sucesso

        // Resetar o estado 'isDirty' do RHF após salvar com sucesso, mantendo os valores atuais
        reset(result.user || data, {
          keepValues: true,
          keepDirty: false,
          keepDefaultValues: false,
        });
      } catch (err) {
        const errorMessage = err.message || "Erro desconhecido";
        console.error(
          `Erro ao ${userId ? "atualizar" : "criar"} usuário:`,
          errorMessage,
          err
        );
        // Define um erro global no formulário
        setError("root", {
          type: "submitError",
          message: `Falha ao salvar usuário: ${errorMessage}`,
        });
        toast.error(`Erro: ${errorMessage}`);
        success = false; // Marca como falha
      } finally {
        dispatch(setIsSubmitting(false)); // Desativa estado de 'submitting'
      }
      return success; // Retorna status para handleAction
      // Dependências do useCallback
    },
    [
      mode,
      userId,
      userService,
      setValue,
      dispatch,
      setError,
      reset,
      setIsSubmitting,
      setPreviewImage,
      setIsFetched,
    ]
  );

  // --- Action Handlers --- (Funções para os botões Salvar, Salvar e Novo, etc.)
  const handleAction = async (action = null) => {
    if (mode === "view") return false; // Não faz nada em modo view
    const isValid = await trigger(); // Dispara validação RHF
    if (!isValid) {
      // Lógica para encontrar a primeira mensagem de erro (incluindo aninhados)
      const findFirstErrorMessage = (errObj) => {
        /* ... (implementação da busca de erro como na resposta anterior) ... */
        if (!errObj) return null;
        const keys = Object.keys(errObj);
        for (const key of keys) {
          const value = errObj[key];
          if (value?.message && typeof value.message === "string")
            return value.message;
          if (typeof value === "object" && value !== null) {
            const nestedMessage = findFirstErrorMessage(value);
            if (nestedMessage) return nestedMessage;
          }
          if (Array.isArray(value)) {
            for (const item of value) {
              const arrayMessage = findFirstErrorMessage(item);
              if (arrayMessage) return arrayMessage;
            }
          }
        }
        return null;
      };
      const errorMessage =
        findFirstErrorMessage(errors) ||
        "Formulário inválido. Verifique os campos.";
      console.log("Validation Errors:", JSON.stringify(errors, null, 2));
      toast.error(errorMessage);
      return false; // Falha na ação
    }
    const currentFormData = getValues(); // Pega os dados válidos
    const success = await onSubmit(currentFormData); // Chama a submissão principal
    // Navega apenas se a submissão foi bem-sucedida
    if (success && action) {
      if (action === "new")
        window.location.href = "/user/register"; // Ideal usar Next Router: router.push(...)
      else if (action === "close") window.history.back(); // Ideal usar Next Router: router.back()
    }
    return success; // Retorna o status da ação
  };
  // Funções específicas para cada botão
  const handleSave = () => handleAction();
  const handleSaveAndNew = () => handleAction("new");
  const handleSaveAndClose = () => handleAction("close");
  const handleCancel = () => window.history.back(); // Ideal: router.back()
  const handleClear = () => {
    if (mode === "view") return;
    reset(defaultValues); // Reseta RHF para padrão
    dispatch(setPreviewImage(null)); // Limpa preview
    dispatch(setIsFetched(false)); // Reseta status de fetch
    toast.success("Formulário limpo.");
  };

  // --- Header Info --- (Define título e ícone baseado no modo)
  const headerInfo = useMemo(() => {
    switch (mode) {
      case "create":
        return {
          title: "Criando Usuário",
          icon: FaRegEdit,
          description: "Preencha os dados abaixo para criar o perfil",
        };
      case "edit":
        return {
          title: "Alterando Usuário",
          icon: FaRegEdit,
          description: "Preencha os dados abaixo para alterar o perfil",
        };
      case "view":
        return {
          title: "Visualizando Usuário",
          icon: FaEye,
          description: "Visualização dos dados do perfil",
        };
      default:
        return {
          title: "Formulário de Usuário",
          icon: FaUserAlt,
          description: "",
        };
    }
  }, [mode]); // Recalcula se o modo mudar

  // --- ReadOnly/Disabled State --- (Define se os campos são editáveis)
  const isReadOnly = mode === "view";
  const isDisabled = mode === "view" || isSubmitting; // Desabilita em view ou durante submit

  // --- JSX --- (Estrutura do formulário)
  return (
    <div className="flex p-2 md:p-12 flex-col min-h-screen bg-light-background-form dark:bg-dark-background-form border border-light-border dark:border-dark-border shadow-xl">
      {/* Cabeçalho */}
      <header className="pb-5 border-b border-light-border dark:border-dark-border">
        <div className="flex items-center gap-3">
          <headerInfo.icon className="w-8 h-8 text-light-primary dark:text-dark-primary" />
          <div className="flex flex-col">
            <h1 className="text-[30px] text-light-text dark:text-dark-text">
              {headerInfo.title}
            </h1>
            <p className="text-sm text-light-muted dark:text-dark-muted">
              {headerInfo.description}
            </p>
          </div>
        </div>
      </header>

      {/* Componente Wrapper do Formulário (lida com botões e estado geral) */}
      <Form
        isSubmitting={isSubmitting}
        // Campo só é "sujo" se não estiver em modo visualização
        isDirty={isDirty && mode !== "view"}
        onSave={handleSave}
        onSaveAndNew={handleSaveAndNew}
        onSaveAndClose={handleSaveAndClose}
        onCancel={handleCancel}
        onClear={handleClear}
        // Mostra botões de ação apenas se não estiver em modo visualização
        showDefaultButtons={mode !== "view"}
      >
        {/* Exibe erro global (de fetch ou submit) */}
        {errors.root && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.root.message}
          </div>
        )}

        {/* Conteúdo Principal do Formulário */}
        <main className="pb-2 pt-12 sm:pb-4 md:pb-6 mb-14 flex-1">
          {/* Seção: Informações Pessoais */}
          <section className="mb-14">
            <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
              <FaUserAlt className="w-5 h-5 text-light-primary dark:text-dark-primary" />{" "}
              Informações Pessoais
            </h2>
            <div className="space-y-6 mt-2">
              <div className="grid grid-cols-1 gap-4">
                {/* Campo de Foto */}
                <PhotoField
                  control={control}
                  name="picture"
                  trigger={trigger}
                  disabled={isDisabled} // Desabilita em view/submit
                  defaultValue={getValues("picture")} // Para preview inicial
                  label="Foto"
                  error={errors.picture?.message}
                />
                {/* Nome */}
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Nome *"
                      {...field}
                      readOnly={isReadOnly}
                      disabled={isSubmitting}
                      error={errors.name?.message}
                      className="w-full md:w-[25rem]"
                      required
                    />
                  )}
                />
                {/* Apelido */}
                <Controller
                  name="nickname"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Apelido"
                      {...field}
                      readOnly={isReadOnly}
                      disabled={isSubmitting}
                      error={errors.nickname?.message}
                      className="w-full md:w-[25rem]"
                    />
                  )}
                />
                {/* Data de Nascimento */}
                <Controller
                  name="birth_date"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="Data de Nascimento"
                      type="date"
                      {...field}
                      // Garante formato YYYY-MM-DD para input date
                      value={
                        field.value
                          ? new Date(field.value).toISOString().substring(0, 10)
                          : ""
                      }
                      readOnly={isReadOnly}
                      disabled={isDisabled} // Usa disabled para date input
                      error={errors.birth_date?.message}
                      className="w-full md:w-[10rem]"
                    />
                  )}
                />
                {/* CPF */}
                <Controller
                  name="cpf"
                  control={control}
                  render={({ field }) => (
                    <CustomInput
                      label="CPF *"
                      {...field}
                      onChange={(e) => {
                        if (!isReadOnly) {
                          setValue("cpf", applyCPFMask(e.target.value), {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        }
                      }}
                      readOnly={isReadOnly}
                      disabled={isSubmitting}
                      maxLength={14}
                      error={errors.cpf?.message}
                      className="w-full md:w-[10rem]"
                      required
                    />
                  )}
                />
              </div>
            </div>
          </section>

          {/* Seção: Segurança (Apenas no modo criação) */}
          {mode === "create" && (
            <section className="mb-14">
              <h2 className="flex items-center gap-2 pb-4 text-lg sm:text-xl text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border">
                <MdLock className="w-7 h-7 text-light-primary dark:text-dark-primary" />{" "}
                Segurança
              </h2>
              <div className="space-y-6 mt-2">
                <div className="flex flex-col gap-4">
                  {/* Senha */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        label="Senha *"
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                        error={errors.password?.message}
                        placeholder="Digite sua senha"
                        className="w-full md:w-[15rem]"
                        required
                      />
                    )}
                  />
                  {/* Confirmação de Senha */}
                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <CustomInput
                        label="Confirmação de Senha *"
                        type="password"
                        {...field}
                        disabled={isSubmitting}
                        error={errors.password_confirmation?.message}
                        placeholder="Confirme sua senha"
                        className="w-full md:w-[15rem]"
                        required
                      />
                    )}
                  />
                </div>
              </div>
            </section>
          )}

          {/* Seção: SubForms (Endereços, Emails, Telefones) */}
          <div className="space-y-14">
            {/* SubForm: Endereços */}
            <SubForm
              title="Endereços"
              icon={FaMapMarkerAlt}
              fields={[
                // Definição dos campos do subform de endereço
                {
                  name: "zip_code",
                  label: "CEP",
                  type: "text",
                  maxLength: 9,
                  inputMode: "numeric",
                  onChange: (e, fieldPath) => {
                    // Handler para buscar CEP
                    if (!isReadOnly) {
                      const cleanedValue = e.target.value.replace(/\D/g, "");
                      let maskedValue = cleanedValue; // Aplica máscara simples
                      if (cleanedValue.length > 5) {
                        maskedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5, 8)}`;
                      }
                      setValue(`${fieldPath}.zip_code`, maskedValue, {
                        shouldDirty: true,
                      });
                      const finalCleanedValue = cleanedValue.slice(0, 8);
                      trigger(`${fieldPath}.zip_code`); // Valida o campo
                      if (finalCleanedValue.length === 8) {
                        fetchAddressHandler(finalCleanedValue, fieldPath);
                      } // Busca se completo
                      else {
                        clearErrors(`${fieldPath}.zip_code`);
                      } // Limpa erro se incompleto
                    }
                  },
                },
                { name: "street", label: "Rua/Avenida *" }, // Campos de endereço
                {
                  name: "number",
                  label: "Número *",
                  type: "text",
                  inputMode: "numeric",
                },
                { name: "complement", label: "Complemento" },
                { name: "district", label: "Bairro *" },
                { name: "city", label: "Cidade *" },
                { name: "state", label: "Estado *" },
                {
                  name: "country",
                  label: "País *",
                  defaultValue: "Brasil",
                  readOnly: true,
                },
              ]}
              // Props para RHF Field Array e validação
              schema={userSchema.fields.addresses.innerType}
              control={control}
              trigger={trigger}
              setValue={setValue}
              getValues={getValues}
              setError={setError}
              clearErrors={clearErrors}
              name="addresses" // Nome do array no RHF
              errors={errors.addresses} // Erros específicos deste array
              isSubmitting={isSubmitting}
              mode={mode} // Passa estado geral
            />

            {/* SubForm: Emails */}
            <SubForm
              title="E-mails"
              icon={FaEnvelope}
              fields={[
                { name: "email", label: "E-mail *", type: "email" },
                // Campo de data/hora de verificação (apenas leitura)
                {
                  name: "email_verified",
                  label: "Verificado em",
                  type: "datetime-local",
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
              errors={errors.emails}
              width="w-full md:w-[35rem]" // Largura
              isSubmitting={isSubmitting}
              mode={mode}
            />

            {/* SubForm: Telefones */}
            <SubForm
              title="Telefones"
              icon={FaPhone}
              fields={[
                {
                  name: "type",
                  label: "Tipo *",
                  type: "select", // Campo tipo (Select)
                  options: [
                    // Opções do select
                    { value: "", label: "Selecione..." },
                    { value: "Pessoal", label: "Pessoal" },
                    { value: "Profissional", label: "Profissional" },
                    { value: "Celular", label: "Celular" },
                    { value: "Principal", label: "Principal" },
                    { value: "Outro", label: "Outro" },
                  ],
                  defaultValue: "",
                },
                {
                  name: "telephone",
                  label: "Telefone *",
                  type: "tel", // Campo telefone
                  maxLength: 15,
                  inputMode: "tel", // Atributos HTML para telefone
                  onChange: (e, fieldPath) => {
                    // Handler para aplicar máscara
                    if (!isReadOnly) {
                      setValue(
                        `${fieldPath}.telephone`,
                        applyTelephoneMask(e.target.value),
                        { shouldValidate: true, shouldDirty: true }
                      );
                    }
                  },
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
              errors={errors.telephones}
              width="w-full md:w-[35rem]"
              isSubmitting={isSubmitting}
              mode={mode}
            />
          </div>
        </main>
      </Form>
    </div>
  );
}
