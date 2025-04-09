/**
 * API de usuário para operações no frontend
 * @module src/frontend/api/userApi
 */

import { mapApiUserToFormUser } from "@/frontend/businnes/mappers/userMapper";

/**
 * Hook que fornece funções para interagir com a API de usuário
 * @param {Function} request - Função para fazer requisições à API
 * @returns {Object} Objeto com funções para interagir com a API de usuário
 */
export const useUserApi = (request) => {
  /**
   * Busca um usuário pelo ID
   * @param {string|number} userId - ID do usuário a ser buscado
   * @returns {Promise<Object>} Dados do usuário no formato do formulário
   * @throws {Error} Erro ao buscar usuário
   */
  const fetchUser = async (userId) => {
    try {
      const res = await request(
        `/api/user/${userId}?address=true&email=true&telephone=true`
      );

      if (!res.ok) {
        const errorMessage =
          res.data?.message || res.error || "Erro desconhecido";
        throw new Error(`Erro ao buscar usuário: ${errorMessage}`);
      }

      return mapApiUserToFormUser(res.data);
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage =
        error.message || `Erro desconhecido ao buscar usuário ${userId}`;
      console.error(
        `Erro na API ao buscar usuário (ID: ${userId}):`,
        errorMessage
      );

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao buscar usuário: ${errorMessage}`);
    }
  };

  /**
   * Envia dados do usuário para criação ou atualização
   * @param {Object} data - Dados do usuário a serem enviados
   * @param {string|number|null} userId - ID do usuário para atualização, ou null para criação
   * @returns {Promise<Object>} Resposta da API
   * @throws {Error} Erro ao salvar usuário
   */
  const submitUser = async (data, userId) => {
    try {
      const operation = userId ? "atualizar" : "criar";
      const endpoint = userId ? `/api/user/${userId}` : "/api/user";
      const method = userId ? "PUT" : "POST";

      const res = await request(endpoint, {
        method,
        data,
      });

      if (!res.ok) {
        const errorMessage =
          res.data?.message || res.error || `Erro ao ${operation} usuário`;
        throw new Error(errorMessage);
      }

      return res;
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const operation = userId ? "atualizar" : "criar";
      const errorMessage =
        error.message || `Erro desconhecido ao ${operation} usuário`;
      console.error(`Erro na API ao ${operation} usuário:`, errorMessage);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao ${operation} usuário: ${errorMessage}`);
    }
  };

  return { fetchUser, submitUser };
};
