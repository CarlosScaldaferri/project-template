/**
 * Serviço de usuário para operações de backend
 * @module src/backend/services/userService
 */

import bcrypt from "bcryptjs";
import {
  dbCreateUser,
  dbGetAllUsers,
  dbUpdateUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbUserIsAdmin,
} from "../repositories/userRepository";

class BackendUserService {
  /**
   * Busca todos os usuários
   * @returns {Promise<Array>} Lista de usuários
   */
  async getAllUsers() {
    try {
      return await dbGetAllUsers();
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error.message);
      throw new Error(`Falha ao buscar usuários: ${error.message}`);
    }
  }

  /**
   * Cria um novo usuário
   * @param {Object} apiUser - Dados do usuário a ser criado
   * @returns {Promise<Object>} Objeto com status da operação e dados do usuário criado
   */
  async createUser(apiUser) {
    try {
      // Hash da senha se fornecida
      if (apiUser.password) {
        // Usar bcrypt assíncrono com salt 10
        apiUser.password = await bcrypt.hash(apiUser.password, 10);
      }

      const user = await dbCreateUser(apiUser);
      return { ok: true, data: user };
    } catch (error) {
      console.error("Erro em createUser:", error);
      return { ok: false, error: error.message };
    }
  }

  /**
   * Atualiza um usuário existente
   * @param {number|string} id - ID do usuário a ser atualizado
   * @param {Object} userData - Dados do usuário a serem atualizados
   * @returns {Promise<Object>} Objeto com status da operação e dados do usuário atualizado
   */
  async updateUser(id, userData) {
    try {
      const userId = Number(id);
      if (isNaN(userId)) {
        throw new Error("ID do usuário inválido para atualização");
      }

      // Optional: Check if user exists before attempting update
      // const existingUser = await this.findUserById(userId);
      // if (!existingUser) {
      //   throw new Error("Usuário não encontrado para atualização");
      // }

      // Directly pass userData to the refactored repository function
      // The repository now handles the complexity using Prisma's 'set'
      const updatedUser = await dbUpdateUser(userId, userData);

      return { ok: true, data: updatedUser };
    } catch (error) {
      console.error(`Erro em updateUser (ID: ${id}):`, error);
      // Consider more specific error handling/returning
      return { ok: false, error: error.message };
    }
  }

  /**
   * Busca um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   * @throws {Error} Erro ao buscar usuário por email
   */
  async findUserByEmail(email) {
    try {
      if (!email) {
        throw new Error("Email não fornecido");
      }

      return await dbFindUserByEmail(email);
    } catch (error) {
      console.error(
        `Erro ao buscar usuário por email (${email}):`,
        error.message
      );
      throw new Error(`Falha ao buscar usuário por email: ${error.message}`);
    }
  }

  /**
   * Verifica se um usuário tem papel de administrador
   * @param {number} id - ID do usuário
   * @returns {Promise<boolean>} true se o usuário é admin, false caso contrário
   * @throws {Error} Erro ao verificar se o usuário é administrador
   */
  async userIsAdmin(id) {
    try {
      if (!id) {
        throw new Error("ID do usuário não fornecido");
      }

      const userId = Number(id);
      if (isNaN(userId)) {
        throw new Error("ID do usuário inválido");
      }

      return await dbUserIsAdmin(userId);
    } catch (error) {
      console.error(
        `Erro ao verificar se usuário é admin (ID: ${id}):`,
        error.message
      );
      throw new Error(
        `Falha ao verificar permissões do usuário: ${error.message}`
      );
    }
  }

  /**
   * Busca um usuário pelo ID
   * @param {number|string} id - ID do usuário
   * @param {Object} includeOptions - Opções para incluir relações
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   * @throws {Error} Erro ao buscar usuário por ID
   */
  async findUserById(id, includeOptions = {}) {
    try {
      if (!id) {
        throw new Error("ID do usuário não fornecido");
      }

      const userId = Number(id);
      if (isNaN(userId)) {
        throw new Error("ID do usuário inválido");
      }

      const user = await dbFindUserById(userId, includeOptions);

      // Não lançamos erro se o usuário não for encontrado, apenas retornamos null
      // Isso permite que o chamador decida como lidar com a ausência do usuário
      return user;
    } catch (error) {
      console.error(`Erro ao buscar usuário por ID (${id}):`, error.message);
      throw new Error(`Falha ao buscar usuário: ${error.message}`);
    }
  }

  /**
   * Cria ou atualiza um usuário dependendo se ele já existe
   * @param {Object} apiUser - Dados do usuário a ser criado ou atualizado
   * @returns {Promise<Object>} Objeto com status da operação e dados do usuário
   * @throws {Error} Erro ao criar ou atualizar usuário
   */
  async createOrUpdateUser(apiUser) {
    try {
      if (!apiUser) {
        throw new Error("Dados do usuário não fornecidos");
      }

      if (!apiUser.id) {
        throw new Error("ID do usuário não fornecido para criação/atualização");
      }

      // Verifica se o usuário existe
      const tempUser = await this.findUserById(apiUser.id);

      if (!tempUser) {
        // Se o usuário não existe, cria um novo (createUser já faz o hash da senha)
        return this.createUser(apiUser);
      }

      // Se o usuário existe, atualiza
      // Nota: updateUser não faz hash da senha, pois a senha só pode ser alterada via fluxo específico
      return this.updateUser(apiUser.id, apiUser);
    } catch (error) {
      console.error(
        `Erro ao criar/atualizar usuário (ID: ${apiUser?.id}):`,
        error.message
      );
      return {
        ok: false,
        error: `Falha ao criar/atualizar usuário: ${error.message}`,
      };
    }
  }
}

const backendUserService = new BackendUserService();
export default backendUserService;
