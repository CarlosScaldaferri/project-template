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
    .test(
      "has-main",
      "Pelo menos uma imagem deve ser marcada como principal",
      (pictures) => pictures.some((pic) => pic.is_main)
    ),
  nickname: Yup.string(),
  picture: Yup.string(),
  birth_date: Yup.date().required("Data de nascimento é obrigatória"),
  cpf: Yup.string().required("CPF é obrigatório"),
  gender: Yup.string().required("Gênero é obrigatório"),
  addresses: Yup.array()
    .of(
      Yup.object().shape({
        zip_code: Yup.string().required("CEP é obrigatório"),
        street: Yup.string().required("Rua é obrigatória"),
        number: Yup.string().required("Número é obrigatório"),
        complement: Yup.string(),
        neighborhood: Yup.string().required("Bairro é obrigatório"),
        city: Yup.string().required("Cidade é obrigatória"),
        state: Yup.string().required("Estado é obrigatório"),
        country: Yup.string().required("País é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um endereço é necessário")
    .test(
      "one-main-address",
      "Pelo menos um endereço deve ser marcado como principal",
      (value) => value && value.some((addr) => addr.is_main)
    ),
  emails: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()
          .email("E-mail inválido")
          .required("E-mail é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um e-mail é necessário")
    .test(
      "one-main-email",
      "Pelo menos um e-mail deve ser marcado como principal",
      (value) => value && value.some((email) => email.is_main)
    ),
  phones: Yup.array()
    .of(
      Yup.object().shape({
        phone: Yup.string().required("Telefone é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um telefone é necessário")
    .test(
      "one-main-phone",
      "Pelo menos um telefone deve ser marcado como principal",
      (value) => value && value.some((phone) => phone.is_main)
    ),
});
