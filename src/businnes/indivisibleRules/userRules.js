import {
  dbCreateUser,
  dbFindUserBySub,
  dbGetAllUsers,
  dbUpdateUser,
} from "@/repositories/userRepository";

export const getAllUsers = () => {
  return dbGetAllUsers();
};

export const createUser = (user, isAuth0Sync) => {
  if (isAuth0Sync) {
    const newUser = {
      sub: user.sub,
      name: user.name || null,
      nickname: user.nickname || null,
      picture: user.picture || null,
      updated_at: user.updated_at || new Date(),
      address: undefined,
      telephone: undefined,
      email: user.email
        ? {
            create: [
              {
                email: user.email,
                is_main: true,
                email_verified: user.email_verified || false,
              },
            ],
          }
        : undefined,
    };
    return dbCreateUser(newUser);
  } else {
    return dbCreateUser({
      sub: user.sub,
      name: user.name,
      nickname: user.nickname,
      picture: user.picture,
      updated_at: new Date(),
      address: user.address || undefined,
      email: user.email || undefined,
      telephone: user.telephone || undefined,
    });
  }
};

export const updateUser = async (user, isAuth0Sync = false) => {
  const existingUser = await dbFindUserBySub(user.sub, {
    address: true,
    email: true,
    telephone: true,
  });

  if (!existingUser) {
    throw new Error("Usuário não encontrado para atualização");
  }

  let updateData;

  if (isAuth0Sync) {
    const emailExists = existingUser.email.some((e) => e.email === user.email);

    updateData = {
      sub: user.sub,
      name: user.name,
      nickname: user.nickname,
      picture: user.picture,
      updated_at: new Date(),
      email: emailExists
        ? {
            update: {
              where: {
                id: existingUser.email.find((e) => e.email === user.email).id,
              },
              data: {
                email: user.email,
                is_main: true,
                email_verified: user.email_verified || false,
              },
            },
          }
        : {
            create: [
              {
                email: user.email,
                is_main: true,
                email_verified: user.email_verified || false,
              },
            ],
          },
    };
  } else {
    // Lógica completa para atualização normal
    const getIds = (items) =>
      items?.map((item) => item.id).filter(Boolean) || [];

    // Emails
    const existingEmails = existingUser.email || [];
    const newEmailIds = getIds(user.email);
    const emailsToDelete = existingEmails
      .filter((e) => !newEmailIds.includes(e.id))
      .map((e) => e.id);
    const emailsToCreate = user.email?.filter((e) => !e.id) || [];
    const emailsToUpdate = user.email?.filter((e) => e.id) || [];

    // Telephones
    const existingTelephones = existingUser.telephone || [];
    const newTelephoneIds = getIds(user.telephone);
    const telephonesToDelete = existingTelephones
      .filter((t) => !newTelephoneIds.includes(t.id))
      .map((t) => t.id);
    const telephonesToCreate = user.telephone?.filter((t) => !t.id) || [];
    const telephonesToUpdate = user.telephone?.filter((t) => t.id) || [];

    // Addresses
    const existingAddresses = existingUser.address || [];
    const newAddressIds = getIds(user.address);
    const addressesToDelete = existingAddresses
      .filter((a) => !newAddressIds.includes(a.id))
      .map((a) => a.id);
    const addressesToCreate = user.address?.filter((a) => !a.id) || [];
    const addressesToUpdate = user.address?.filter((a) => a.id) || [];

    updateData = {
      sub: user.sub,
      name: user.name,
      nickname: user.nickname,
      picture: user.picture,
      birth_date: user.birth_date,
      cpf: user.cpf,
      updated_at: new Date(),
      email: {
        deleteMany:
          emailsToDelete.length > 0
            ? { id: { in: emailsToDelete } }
            : undefined,
        create:
          emailsToCreate.length > 0
            ? emailsToCreate.map((e) => ({
                email: e.email,
                is_main: e.is_main,
                email_verified: e.email_verified,
              }))
            : undefined,
        update:
          emailsToUpdate.length > 0
            ? emailsToUpdate.map((e) => ({
                where: { id: e.id },
                data: {
                  email: e.email,
                  is_main: e.is_main,
                  email_verified: e.email_verified,
                },
              }))
            : undefined,
      },
      telephone: {
        deleteMany:
          telephonesToDelete.length > 0
            ? { id: { in: telephonesToDelete } }
            : undefined,
        create:
          telephonesToCreate.length > 0
            ? telephonesToCreate.map((t) => ({
                country_code: t.country_code,
                state_code: t.state_code,
                number: t.number,
                full_number: t.full_number,
                type: t.type,
                is_main: t.is_main,
              }))
            : undefined,
        update:
          telephonesToUpdate.length > 0
            ? telephonesToUpdate.map((t) => ({
                where: { id: t.id },
                data: {
                  country_code: t.country_code,
                  state_code: t.state_code,
                  number: t.number,
                  full_number: t.full_number,
                  type: t.type,
                  is_main: t.is_main,
                },
              }))
            : undefined,
      },
      address: {
        deleteMany:
          addressesToDelete.length > 0
            ? { id: { in: addressesToDelete } }
            : undefined,
        create:
          addressesToCreate.length > 0
            ? addressesToCreate.map((a) => ({
                zip_code: a.zip_code,
                street: a.street,
                number: a.number,
                complement: a.complement,
                district: a.district,
                city: a.city,
                state: a.state,
                country: a.country,
                is_main: a.is_main,
              }))
            : undefined,
        update:
          addressesToUpdate.length > 0
            ? addressesToUpdate.map((a) => ({
                where: { id: a.id },
                data: {
                  zip_code: a.zip_code,
                  street: a.street,
                  number: a.number,
                  complement: a.complement,
                  district: a.district,
                  city: a.city,
                  state: a.state,
                  country: a.country,
                  is_main: a.is_main,
                },
              }))
            : undefined,
      },
    };
  }

  // Chama dbUpdateUser com os dados preparados e o parâmetro isAuth0Sync
  return await dbUpdateUser(user.sub, updateData, isAuth0Sync);
};

export const findUserBySub = (sub, includeOptions = {}) => {
  return dbFindUserBySub(sub, includeOptions);
};

// utils/userMapper.js
export const mapAuth0UserToDbUser = (auth0User) => {
  const mapped = {
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
  return mapped;
};

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
        telefhones: formUser.telephones || [],
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
        telefhones: formUser.telephones || [],
        emails: formUser.emails || [],
        addresses: formUser.addresses || [],
      },
    };
  }

  return auth0User;
};

export const mapFormUserToDbUser = (formUser) => {
  const parseTelephone = (telephone) => {
    if (!telephone || typeof telephone !== "string") return null;

    const phoneRegex = /^\+(\d{2})\s\((\d{2})\)\s(\d{4,5}-\d{4})$/;
    const match = telephone.match(phoneRegex);

    if (match) {
      const [, country_code, state_code, number] = match;
      const full_number = `${country_code}${state_code}${number.replace("-", "")}`;
      return {
        country_code: parseInt(country_code, 10), // Converte para inteiro
        state_code: parseInt(state_code, 10), // Converte para inteiro
        number: parseInt(number.replace("-", ""), 10), // Remove hífen e converte
        full_number, // Número completo sem máscara
      };
    }
    return null;
  };

  const mappedTelephones = formUser.telephones
    ? formUser.telephones.map((phone) => {
        const parsedPhone = parseTelephone(phone.telephone);
        if (!parsedPhone) {
          return {
            id: phone.id || undefined, // Inclui o id se existir, senão undefined
            is_main: phone.is_main,
            type: phone.type,
            country_code: null,
            state_code: null,
            number: null,
            full_number: null,
          };
        }
        return {
          id: phone.id || undefined, // Inclui o id se existir, senão undefined
          is_main: phone.is_main,
          type: phone.type,
          ...parsedPhone,
        };
      })
    : undefined;

  const mappedEmails = formUser.emails
    ? formUser.emails.map((email) => ({
        id: email.id || undefined, // Inclui o id se existir, senão undefined
        email: email.email,
        is_main: email.is_main,
        email_verified: email.email_verified,
      }))
    : undefined;

  const mappedAddresses = formUser.addresses
    ? formUser.addresses.map((address) => ({
        id: address.id || undefined, // Inclui o id se existir, senão undefined
        zip_code: address.zip_code,
        street: address.street,
        number: address.number ? parseInt(address.number, 10) : null, // Converte para inteiro
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

  const mapped = {
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
  return mapped;
};
