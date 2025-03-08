import * as Yup from "yup";

const userSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  nickname: Yup.string(),
  birth_date: Yup.date().nullable().typeError("Data de nascimento inválida"),
  cpf: Yup.string()
    .matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF inválido")
    .required("CPF é obrigatório"),
  gender: Yup.string(),
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
    .min(1, "Pelo menos um endereço é necessário"),
  emails: Yup.array()
    .of(
      Yup.object().shape({
        email: Yup.string()
          .email("E-mail inválido")
          .required("E-mail é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um e-mail é necessário"),
  phones: Yup.array()
    .of(
      Yup.object().shape({
        phone: Yup.string().required("Telefone é obrigatório"),
        is_main: Yup.boolean(),
      })
    )
    .min(1, "Pelo menos um telefone é necessário"),
});
