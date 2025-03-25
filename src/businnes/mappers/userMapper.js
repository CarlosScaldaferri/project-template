// src/businnes/mappers/userMapper.js

/**
 * Mapeia um usuário do Auth0 para o formato do banco de dados.
 * @param {Object} auth0User - Dados do usuário do Auth0
 * @returns {Object} - Dados mapeados para o banco de dados
 */
export const mapAuth0UserToDbUser = (auth0User) => {
  return {
    sub: auth0User.sub,
    name: auth0User.name || null,
    nickname: auth0User.nickname || null,
    picture: auth0User.picture || null,
    updated_at: new Date(),
    email: auth0User.email
      ? [
          {
            email: auth0User.email,
            is_main: true,
            email_verified: auth0User.email_verified || true,
          },
        ]
      : undefined,
    telephone: [],
    address: [],
  };
};

/**
 * Mapeia um usuário do formulário para o formato do Auth0.
 * @param {Object} formUser - Dados do usuário do formulário
 * @returns {Object} - Dados mapeados para o Auth0
 */
export const mapFormUserToAuth0User = (formUser) => {
  const isSocialConnection = !formUser.sub?.startsWith("auth0|");
  let auth0User;
  if (!isSocialConnection) {
    auth0User = {
      nickname: formUser.nickname,
      name: formUser.name,
      picture: formUser.picture,
      updated_at: formUser.updated_at,
      user_metadata: {
        birth_date: formUser.birth_date,
        cpf: formUser.cpf,
        telephones: formUser.telephones || [],
        emails: formUser.emails || [],
        addresses: formUser.addresses || [],
      },
    };
  } else {
    auth0User = {
      user_metadata: {
        nickname: formUser.nickname,
        name: formUser.name,
        picture: formUser.picture,
        updated_at: formUser.updated_at,
        birth_date: formUser.birth_date,
        cpf: formUser.cpf,
        telephones: formUser.telephones || [],
        emails: formUser.emails || [],
        addresses: formUser.addresses || [],
      },
    };
  }
  return auth0User;
};

/**
 * Mapeia um usuário do formulário para o formato do banco de dados.
 * @param {Object} formUser - Dados do usuário do formulário
 * @returns {Object} - Dados mapeados para o banco de dados
 */
export const mapFormUserToDbUser = (formUser) => {
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
    sub: formUser.sub,
    name: formUser.name || null,
    nickname: formUser.nickname || null,
    picture: formUser.picture || null,
    updated_at: new Date(),
    birth_date: birthDate,
    cpf: formUser.cpf || null,
    email: mappedEmails,
    telephone: mappedTelephones,
    address: mappedAddresses,
  };
};
