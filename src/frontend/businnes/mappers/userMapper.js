import bcrypt from "bcryptjs";

// src/frontend/businnes/mappers/userMapper.js
export const mapFormUserToApiUser = (formUser) => {
  const parseTelephone = (telephone) => {
    if (!telephone || typeof telephone !== "string") return null;
    const phoneRegex = /^\+(\d{2})\s\((\d{2})\)\s(\d{4,5}-\d{4})$/;
    const match = telephone.match(phoneRegex);
    if (match) {
      const [, country_code, state_code, number] = match;
      const full_number = `${country_code}${state_code}${number.replace("-", "")}`;
      return {
        country_code: parseInt(country_code, 10),
        state_code: parseInt(state_code, 10),
        number: parseInt(number.replace("-", ""), 10),
        full_number,
      };
    }
    return null;
  };

  const mappedTelephones = formUser.telephones
    ? formUser.telephones.map((phone) => {
        const parsedPhone = parseTelephone(phone.telephone);
        if (!parsedPhone) {
          return {
            id: phone.id || undefined,
            is_main: phone.is_main,
            type: phone.type,
            country_code: null,
            state_code: null,
            number: null,
            full_number: null,
          };
        }
        return {
          id: phone.id || undefined,
          is_main: phone.is_main,
          type: phone.type,
          ...parsedPhone,
        };
      })
    : undefined;

  const mappedEmails = formUser.emails
    ? formUser.emails.map((email) => ({
        id: email.id || undefined,
        email: email.email,
        is_main: email.is_main,
        email_verified: email.email_verified,
      }))
    : undefined;

  const mappedAddresses = formUser.addresses
    ? formUser.addresses.map((address) => ({
        id: address.id || undefined,
        zip_code: address.zip_code ? parseInt(address.zip_code) : null,
        street: address.street,
        number: address.number ? parseInt(address.number, 10) : null,
        complement: address.complement,
        district: address.district,
        city: address.city,
        state: address.state,
        country: address.country,
        is_main: address.is_main,
      }))
    : undefined;

  const birthDate = formUser.birth_date
    ? new Date(formUser.birth_date).toISOString()
    : null;

  return {
    id: formUser.id ? Number(formUser.id) : null,
    name: formUser.name || null,
    nickname: formUser.nickname || null,
    picture: formUser.picture || null,
    updated_at: new Date(),
    birth_date: birthDate,
    cpf: formUser.cpf || null,
    password: formUser.password ? bcrypt.hashSync(formUser.password) : null,
    email: mappedEmails,
    telephone: mappedTelephones,
    address: mappedAddresses,
  };
};

export const cleanUserDataForForm = (data) => ({
  ...data,
  addresses:
    data.addresses?.filter((item) => item && Object.keys(item).length > 0) ||
    [],
  emails:
    data.emails?.filter((item) => item && Object.keys(item).length > 0) || [],
  telephones:
    data.telephones?.filter((item) => item && Object.keys(item).length > 0) ||
    [],
});

export const mapApiUserToFormUser = (apiUser) => {
  if (!apiUser) return null;

  // Formata a data de nascimento para o formato YYYY-MM-DD (input type date)
  const formatBirthDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Mapeia telefones para o formato do formulário
  const mapTelephones = (telephones) => {
    if (!telephones || !Array.isArray(telephones)) return [];

    return telephones.map((phone) => ({
      id: phone.id || undefined,
      telephone: phone.full_number
        ? `+${phone.country_code} (${phone.state_code}) ${String(phone.number).replace(/(\d{4,5})(\d{4})/, "$1-$2")}`
        : "",
      is_main: phone.is_main || false,
      type: phone.type || "Pessoal",
    }));
  };

  // Mapeia emails para o formato do formulário
  const mapEmails = (emails) => {
    if (!emails || !Array.isArray(emails)) return [];

    return emails.map((email) => ({
      id: email.id || undefined,
      email: email.email || "",
      is_main: email.is_main || false,
      email_verified: email.email_verified || null,
    }));
  };

  // Mapeia endereços para o formato do formulário
  const mapAddresses = (addresses) => {
    if (!addresses || !Array.isArray(addresses)) return [];

    return addresses.map((address) => ({
      id: address.id || undefined,
      zip_code: address.zip_code
        ? String(address.zip_code).padStart(8, "0")
        : "",
      street: address.street || "",
      number: address.number ? String(address.number) : "",
      complement: address.complement || "",
      district: address.district || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "Brasil",
      is_main: address.is_main || false,
    }));
  };

  // Tratamento da imagem - converte para URL completa se necessário
  const processPicture = (picture) => {
    if (!picture) return null;

    // Se já for uma URL completa
    if (typeof picture === "string" && picture.startsWith("http")) {
      return picture;
    }

    // Se for um caminho relativo
    if (typeof picture === "string") {
      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return `${baseUrl}${process.env.NEXT_PUBLIC_UPLOADS}${picture.startsWith("/") ? "" : "/"}${picture}`;
    }

    // Se for um objeto File (caso de edição)
    return picture;
  };

  return {
    id: apiUser.id,
    name: apiUser.name || "",
    nickname: apiUser.nickname || "",
    birth_date: formatBirthDate(apiUser.birth_date),
    picture: processPicture(apiUser.picture),
    cpf: apiUser.cpf || "",
    telephones: mapTelephones(apiUser.telephone),
    emails: mapEmails(apiUser.email),
    addresses: mapAddresses(apiUser.address),
  };
};
