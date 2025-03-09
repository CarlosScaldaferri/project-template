import * as yup from "yup";

const addressSchema = yup.object().shape({
  zip_code: yup.string().required("CEP é obrigatório"),
  street: yup.string().required("Rua/Avenida é obrigatória"),
  number: yup.string().required("Número é obrigatório"),
  complement: yup.string(),
  neighborhood: yup.string().required("Bairro é obrigatório"),
  city: yup.string().required("Cidade é obrigatória"),
  state: yup.string().required("Estado é obrigatório"),
  country: yup.string().required("País é obrigatório"),
  is_main: yup.boolean().default(false),
});

const emailSchema = yup.object().shape({
  email: yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
  is_main: yup.boolean().default(false),
  email_verified: yup.boolean().default(false),
});

const phoneSchema = yup.object().shape({
  phone: yup.string().required("Telefone é obrigatório"),
  is_main: yup.boolean().default(false),
});

export const userSchema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  nickname: yup.string(),
  picture: yup.string(),
  birth_date: yup.string().required("Data de nascimento é obrigatória"),
  cpf: yup
    .string()
    .required("CPF é obrigatório")
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido"),
  gender: yup.string().required("Gênero é obrigatório"),
  addresses: yup
    .array()
    .of(addressSchema)
    .min(1, "Pelo menos um endereço é obrigatório")
    .test(
      "at-least-one-main-address",
      "Pelo menos um endereço deve ser marcado como principal",
      (value) => value && value.some((address) => address.is_main === true)
    ),
  emails: yup
    .array()
    .of(emailSchema)
    .min(1, "Pelo menos um e-mail é obrigatório")
    .test(
      "at-least-one-main-email",
      "Pelo menos um e-mail deve ser marcado como principal",
      (value) => value && value.some((email) => email.is_main === true)
    ),
  phones: yup
    .array()
    .of(phoneSchema)
    .min(1, "Pelo menos um telefone é obrigatório")
    .test(
      "at-least-one-main-phone",
      "Pelo menos um telefone deve ser marcado como principal",
      (value) => value && value.some((phone) => phone.is_main === true)
    ),
});
