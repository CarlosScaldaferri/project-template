// src/backend/services/userService.js

import {
  dbCreateUser,
  dbGetAllUsers,
  dbUpdateUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbUserIsAdmin,
} from "../repositories/userRepository";

class BackendUserService {
  async getAllUsers() {
    return dbGetAllUsers();
  }

  async createUser(apiUser) {
    try {
      const user = await dbCreateUser(apiUser);
      return { ok: true, data: user };
    } catch (error) {
      console.error("Erro em createUser:", error);
      return { ok: false, error: error.message };
    }
  }

  async updateUser(id, userData) {
    const existingUser = await backendUserService.findUserById(id, {
      address: true,
      email: true,
      telephone: true,
    });

    if (!existingUser) {
      throw new Error("Usuário não encontrado para atualização");
    }

    const getIds = (items) =>
      items?.map((item) => item.id).filter(Boolean) || [];

    const existingEmails = existingUser.email || [];
    const newEmails = userData.email || [];
    const newEmailIds = getIds(newEmails);
    const emailsToDelete = existingEmails
      .filter((e) => !newEmailIds.includes(e.id))
      .map((e) => e.id);
    const emailsToCreate = newEmails.filter((e) => !e.id);
    const emailsToUpdate = newEmails.filter((e) => e.id);

    const existingTelephones = existingUser.telephone || [];
    const newTelephones = userData.telephone || [];
    const newTelephoneIds = getIds(newTelephones);
    const telephonesToDelete = existingTelephones
      .filter((t) => !newTelephoneIds.includes(t.id))
      .map((t) => t.id);
    const telephonesToCreate = newTelephones.filter((t) => !t.id);
    const telephonesToUpdate = newTelephones.filter((t) => t.id);

    const existingAddresses = existingUser.address || [];
    const newAddresses = userData.address || [];
    const newAddressIds = getIds(newAddresses);
    const addressesToDelete = existingAddresses
      .filter((a) => !newAddressIds.includes(a.id))
      .map((a) => a.id);
    const addressesToCreate = newAddresses.filter((a) => !a.id);
    const addressesToUpdate = newAddresses.filter((a) => a.id);

    const updateData = {
      name: userData.name ?? existingUser.name,
      nickname: userData.nickname ?? existingUser.nickname,
      picture: userData.picture ?? existingUser.picture,
      birth_date: userData.birth_date ?? existingUser.birth_date,
      cpf: userData.cpf ?? existingUser.cpf,
      updated_at: new Date(),
      email:
        newEmails.length > 0
          ? {
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
            }
          : undefined,
      telephone:
        newTelephones.length > 0
          ? {
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
            }
          : undefined,
      address:
        newAddresses.length > 0
          ? {
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
            }
          : undefined,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );
    const userId = Number(id);

    const updatedUser = await dbUpdateUser(userId, updateData);

    return { ok: true, data: updatedUser };
  }

  async findUserByEmail(email) {
    return dbFindUserByEmail(email);
  }

  async userIsAdmin(id) {
    return dbUserIsAdmin(id);
  }

  async findUserById(id, includeOptions = {}) {
    try {
      if (!id) {
        throw new Error("ID do usuário não fornecido");
      }

      const userId = Number(id);
      if (isNaN(userId)) {
        throw new Error("ID do usuário inválido");
      }

      return await dbFindUserById(userId, includeOptions);
    } catch (error) {
      console.error("Erro no serviço ao buscar usuário por ID:", error);
      throw error; // Propague o erro para ser tratado na rota
    }
  }

  async createOrUpdateUser(apiUser) {
    const tempUser = await this.findUserById(apiUser.id);
    if (!tempUser) {
      return this.createUser(apiUser);
    }
    return this.updateUser(apiUser.id, apiUser);
  }
}

const backendUserService = new BackendUserService();
export default backendUserService;
