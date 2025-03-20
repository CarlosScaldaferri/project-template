import * as Yup from "yup";

export const userSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  pictures: Yup.array()
    .of(
      Yup.object().shape({
        url: Yup.string().required("Imagem é obrigatória"),
        is_main: Yup.boolean(),
      })
    )
    .default([])
    .test(
      "has-main",
      "Pelo menos uma imagem deve ser marcada como principal",
      (pictures) =>
        pictures?.length > 0 ? pictures.some((pic) => pic.is_main) : true
    ),
  nickname: Yup.string(),
  picture: Yup.string(),
  birth_date: Yup.date().required("Data de nascimento é obrigatória"),
  cpf: Yup.string().required("CPF é obrigatório"),
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
        email_verified: Yup.boolean(),
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
            // Valida ambos os formatos: +55 (XX) XXXX-XXXX e +55 (XX) XXXXX-XXXX
            const isValidFix = /^\+55 \(\d{2}\) \d{4}-\d{4}$/.test(value); // Fixo
            const isValidCel = /^\+55 \(\d{2}\) \d{5}-\d{4}$/.test(value); // Celular
            return isValidFix || isValidCel; // Aceita qualquer um dos dois formatos
          }),
        type: Yup.string().oneOf(
          ["Pessoal", "Profissional"],
          "Tipo deve ser Pessoal ou Profissional"
        ), // Ajuste opcional para type
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
