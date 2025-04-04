import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  nickname: Yup.string(),
  picture: Yup.mixed()
    .required("Foto é obrigatória")
    .test(
      "is-valid-type",
      "Foto deve ser uma imagem válida (JPEG, PNG ou GIF)",
      (value) => {
        if (!value) return false; // Rejeita null ou undefined
        if (typeof value === "string") return value.trim() !== ""; // Aceita string não vazia
        if (value instanceof File) {
          return ["image/jpeg", "image/png", "image/gif"].includes(value.type); // Valida tipo
        }
        return false;
      }
    )
    .test("fileSize", "O arquivo é muito grande (máx. 2MB)", (value) => {
      if (value instanceof File) {
        return value.size <= 2 * 1024 * 1024; // Máx. 2MB
      }
      return true; // Não aplica a string
    }),
  birth_date: Yup.date().required("Data de nascimento é obrigatória"),
  cpf: Yup.string().required("CPF é obrigatório"),
  password: Yup.string().when("$isCreateMode", {
    is: true,
    then: (schema) =>
      schema
        .required("Senha é obrigatória")
        .min(8, "Senha deve ter pelo menos 8 caracteres")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
          "Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial"
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  password_confirmation: Yup.string().when("$isCreateMode", {
    is: true,
    then: (schema) =>
      schema
        .required("Confirmação de senha é obrigatória")
        .oneOf([Yup.ref("password")], "As senhas devem coincidir"),
    otherwise: (schema) => schema.notRequired(),
  }),
  addresses: Yup.array()
    .of(
      Yup.object().shape({
        zip_code: Yup.string().required("CEP é obrigatório"),
        street: Yup.string().required("Rua é obrigatória"),
        number: Yup.string().required("Número é obrigatório"),
        complement: Yup.string(),
        district: Yup.string().required("Bairro é obrigatório"),
        city: Yup.string().required("Cidade é obrigatória"),
        state: Yup.string().required("Estado é obrigatório"),
        country: Yup.string().required("País é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um endereço é necessário")
    .default([])
    .test(
      "one-main-address",
      "Pelo menos um endereço deve ser marcado como principal",
      (value) =>
        value?.length > 0 ? value.some((addr) => addr.is_main) : false
    ),
  emails: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()
          .email("E-mail inválido")
          .required("E-mail é obrigatório"),
        is_main: Yup.boolean(),
        email_verified: Yup.date().nullable(),
      })
    )
    .min(1, "Pelo menos um e-mail é necessário")
    .default([])
    .test(
      "one-main-email",
      "Pelo menos um e-mail deve ser marcado como principal",
      (value) =>
        value?.length > 0 ? value.some((email) => email.is_main) : false
    ),
  telephones: Yup.array()
    .of(
      Yup.object().shape({
        telephone: Yup.string()
          .required("Telefone é obrigatório")
          .test("phone-format", "Formato de telefone inválido", (value) => {
            const isValidFix = /^\+55 \(\d{2}\) \d{4}-\d{4}$/.test(value);
            const isValidCel = /^\+55 \(\d{2}\) \d{5}-\d{4}$/.test(value);
            return isValidFix || isValidCel;
          }),
        type: Yup.string().oneOf(
          ["Pessoal", "Profissional"],
          "Tipo deve ser Pessoal ou Profissional"
        ),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um telefone é necessário")
    .default([])
    .test(
      "one-main-phone",
      "Pelo menos um telefone deve ser marcado como principal",
      (value) =>
        value?.length > 0 ? value.some((phone) => phone.is_main) : false
    ),
});
