/**
 * Serviço de usuário para operações de backend
 * @module src/backend/services/userService
 */

import bcrypt from "bcryptjs";
import {
  dbGetUsers,
  dbCreateUser,
  dbUpdateUser,
  dbFindUserByEmail,
  dbFindUserById,
  dbUserIsAdmin,
} from "../repositories/userRepository";

class BackendUserService {
  /**
   * Busca usuários com paginação
   * @param {number} startIndex - Índice inicial do intervalo
   * @param {number} endIndex - Índice final do intervalo (não inclusivo)
   * @returns {Promise<Array>} Lista de usuários dentro do intervalo
   */
  async getUsers(options) {
    const {
      skip,
      take,
      sortField,
      sortOrder,
      searchTerm,
      includeMainEmail,
      includeMainTelephone,
      includeMainAddress,
      secondarySortField,
      secondarySortOrder,
    } = options;

    try {
      // --- 1. Constrói objeto 'where' para filtro ---
      const where = {};
      if (searchTerm) {
        where.OR = [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { nickname: { contains: searchTerm, mode: "insensitive" } },
          { cpf: { contains: searchTerm, mode: "insensitive" } },
          // Adicionar busca em campos relacionados aqui requer lógica mais complexa
        ];
      }

      // --- 2. Constrói array 'orderBy' ---
      const orderBy = [];
      orderBy.push({ [sortField]: sortOrder });
      if (secondarySortField && secondarySortField !== sortField) {
        orderBy.push({ [secondarySortField]: secondarySortOrder });
      }
      // Atenção à ordenação por campos como 'mainEmail'/'mainTelephone' - pode exigir ajustes

      // --- 3. Constrói objeto 'include' para dados principais ---
      const include = {};
      if (includeMainEmail) {
        include.email = {
          // Nome da relação no model 'user'
          where: { is_main: true },
          take: 1,
          select: { email: true }, // Seleciona apenas o campo necessário
        };
      }
      if (includeMainTelephone) {
        include.telephone = {
          // Nome da relação no model 'user'
          where: { is_main: true },
          take: 1,
          // Seleciona campos para montar ou usa 'full_number'
          select: {
            country_code: true,
            state_code: true,
            number: true,
            full_number: true,
          },
        };
      }
      if (includeMainAddress) {
        // VERIFIQUE A RELAÇÃO NO SEU MODEL 'user' (address ou addresses)
        include.address = {
          // Assumindo 'address address[]' no model user
          where: { is_main: true }, // Assume campo 'is_main' em 'address'
          take: 1,
          select: {
            street: true,
            number: true,
            city: true,
            zip: true /* outros campos*/,
          },
        };
      }

      // --- 4. Chama a camada de banco de dados ---
      const { users, count } = await dbGetUsers({
        skip,
        take,
        where,
        orderBy,
        include: Object.keys(include).length > 0 ? include : undefined,
      });

      // --- 5. Transformação de Dados ---
      const transformedUsers = users.map((user) => {
        // Extrai email principal
        const mainEmail = includeMainEmail
          ? (user.email?.[0]?.email ?? null)
          : undefined;

        // Extrai telefone principal
        const mainTelephoneData = includeMainTelephone
          ? user.telephone?.[0]
          : null;
        let mainTelephoneNumber = null;
        if (mainTelephoneData) {
          mainTelephoneNumber =
            mainTelephoneData.full_number ||
            `(${mainTelephoneData.country_code || ""}) ${mainTelephoneData.state_code || ""} ${mainTelephoneData.number || ""}`;
          mainTelephoneNumber = mainTelephoneNumber.trim();
        }

        // Extrai endereço principal
        const mainAddressData = includeMainAddress ? user.address?.[0] : null;
        let mainAddressString = null;
        if (mainAddressData) {
          const parts = [
            mainAddressData.street,
            mainAddressData.number,
            mainAddressData.city,
            mainAddressData.zip,
          ];
          mainAddressString = parts.filter(Boolean).join(", ");
        }

        // Remove as propriedades relacionais originais
        const { email, telephone, address, ...restOfUser } = user;

        // Retorna o objeto do usuário transformado
        return {
          ...restOfUser,
          ...(includeMainEmail && { mainEmail }),
          ...(includeMainTelephone && { mainTelephone: mainTelephoneNumber }),
          ...(includeMainAddress && { mainAddress: mainAddressString }),
        };
      });

      // --- 6. Retorna sucesso ---
      return { ok: true, data: transformedUsers, totalCount: count };
    } catch (error) {
      console.error("Erro no serviço getUsers:", {
        // Mantido console.error básico
        errorMessage: error.message,
        // options: options // Descomente se precisar ver as opções no erro
      });
      // Propaga o erro para ser tratado pelo createApiHandler
      throw new Error(`Falha ao processar busca de usuários: ${error.message}`);
      // OU retorne { ok: false, error: ... } se createApiHandler não tratar throws
      // return { ok: false, error: `Falha ao processar busca de usuários: ${error.message}` };
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
}

const backendUserService = new BackendUserService();
export default backendUserService;
