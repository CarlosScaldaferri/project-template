// src/businnes/services/userService.js
import {
  dbCreateUser,
  dbFindUserBySub,
  dbGetAllUsers,
  dbUpdateUser,
} from "@/repositories/userRepository";
import * as userMapper from "@/businnes/mappers/userMapper";
import { applyTelephoneMask } from "@/businnes/rules/generalRules";

export const getAllUsers = () => {
  return dbGetAllUsers();
};

export const createUser = (user, isAuth0Sync) => {
  let mappedUser;
  if (isAuth0Sync) {
    mappedUser = userMapper.mapAuth0UserToDbUser(user);
  } else {
    mappedUser = userMapper.mapFormUserToDbUser(user);
  }

  return dbCreateUser(mappedUser);
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

export const createOrUpdateUser = async (user, isAuth0Sync) => {
  let tempUser = await findUserBySub(user.sub);
  if (!tempUser) {
    return createUser(user, isAuth0Sync);
  } else {
    return updateUser(user, isAuth0Sync);
  }
};

// src/businnes/services/userService.js
export const fetchUserData = async (id, request, setUserData, setIsFetched) => {
  try {
    const data = await request(`/api/users/${id}`, { method: "GET" });
    setUserData({
      sub: data.sub,
      name: data.name || "",
      nickname: data.nickname || "",
      picture: data.picture || "",
      birth_date: data.birth_date
        ? new Date(data.birth_date).toISOString().split("T")[0]
        : "",
      cpf: data.cpf || "",
      addresses: Array.isArray(data.address) ? data.address : [],
      emails: Array.isArray(data.email)
        ? data.email.map((email) => ({
            ...email,
            email_verified: email.email_verified ?? false,
          }))
        : [],
      telephones: Array.isArray(data.telephone)
        ? data.telephone.map((phone) => ({
            ...phone,
            telephone: applyTelephoneMask(phone.full_number),
          }))
        : [],
      connection: data.sub ? data.sub.split("|")[0] : null,
    });
    setIsFetched(true);
  } catch (error) {
    console.error("Erro ao carregar dados:", error);
    setIsFetched(true);
  }
};
