/**
 * Serviço de usuário para operações de frontend
 * @module src/frontend/services/userService
 */

import {
  mapFormUserToApiUser,
  cleanUserDataForForm,
} from "@/frontend/businnes/mappers/userMapper";
import { applyTelephoneMask } from "@/shared/businnes/rules/generalRules";

/**
 * Classe que gerencia as operações de usuário no frontend
 */
class UserService {
  /**
   * Cria uma instância do serviço de usuário
   * @param {Function} apiService - Função para fazer requisições à API
   */
  constructor(apiService) {
    this.apiService = apiService;
    this.imageApi = null;
  }

  /**
   * Configura a API de imagem para uso no serviço
   * @param {Object} imageApi - API de imagem com métodos uploadImage, confirmUpload e deleteImage
   */
  setImageApi(imageApi) {
    this.imageApi = imageApi;
  }

  /**
   * Busca os dados de um usuário pelo ID e atualiza o estado
   * @param {string|number} userId - ID do usuário a ser buscado
   * @param {Function} setUserData - Função para atualizar os dados do usuário no estado
   * @param {Function} setIsFetched - Função para atualizar o estado de carregamento
   * @throws {Error} Erro ao carregar dados do usuário
   */
  async fetchUserData(userId, setUserData, setIsFetched) {
    try {
      // Busca os dados do usuário na API
      const data = await this.apiService(`/api/user/${userId}`);

      // Verifica se a resposta contém erro
      if (!data || data.error) {
        throw new Error(
          data?.error || `Falha ao buscar usuário com ID ${userId}`
        );
      }

      // Limpa e formata os dados para o formato do formulário
      const cleanData = cleanUserDataForForm(data);

      // Mapeia os dados para o formato esperado pelo estado
      setUserData({
        id: cleanData.id,
        name: cleanData.name || "",
        nickname: cleanData.nickname || "",
        picture: cleanData.picture || "",
        birth_date: cleanData.birth_date
          ? new Date(cleanData.birth_date).toISOString().split("T")[0]
          : "",
        cpf: cleanData.cpf || "",
        addresses: cleanData.addresses,
        emails: cleanData.emails.map((email) => ({
          ...email,
          email_verified: email.email_verified ?? null,
        })),
        telephones: cleanData.telephones.map((phone) => ({
          ...phone,
          telephone: applyTelephoneMask(phone.telephone),
        })),
      });

      // Indica que o carregamento foi concluído
      setIsFetched(true);
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage =
        error.message || `Erro desconhecido ao buscar usuário ${userId}`;
      console.error(
        `Erro ao carregar dados do usuário (ID: ${userId}):`,
        errorMessage,
        error
      );

      // Indica que o carregamento foi concluído, mesmo com erro
      setIsFetched(true);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao carregar dados do usuário: ${errorMessage}`);
    }
  }

  /**
   * Processa o upload de uma imagem
   * @param {File} imageFile - Arquivo de imagem a ser enviado
   * @returns {Promise<string>} ID temporário da imagem enviada
   * @throws {Error} Erro ao fazer upload da imagem
   * @private
   */
  async _processImageUpload(imageFile) {
    if (!this.imageApi) {
      throw new Error("API de imagem não configurada");
    }

    try {
      return await this.imageApi.uploadImage(imageFile);
    } catch (error) {
      const errorMessage = error.message || "Erro desconhecido";
      console.error("Erro ao fazer upload da imagem:", errorMessage, error);
      throw new Error(`Falha ao enviar imagem: ${errorMessage}`);
    }
  }

  /**
   * Confirma o upload de uma imagem
   * @param {string} tempFileId - ID temporário da imagem enviada
   * @returns {Promise<string>} URL da imagem confirmada
   * @throws {Error} Erro ao confirmar o upload da imagem
   * @private
   */
  async _confirmImageUpload(tempFileId) {
    if (!this.imageApi) {
      throw new Error("API de imagem não configurada");
    }

    try {
      return await this.imageApi.confirmUpload(tempFileId);
    } catch (error) {
      const errorMessage = error.message || "Erro desconhecido";
      console.error("Erro ao confirmar upload da imagem:", errorMessage, error);
      throw new Error(`Falha ao confirmar imagem: ${errorMessage}`);
    }
  }

  /**
   * Exclui uma imagem temporária
   * @param {string} tempFileId - ID temporário da imagem a ser excluída
   * @returns {Promise<void>}
   * @private
   */
  async _deleteTemporaryImage(tempFileId) {
    if (!this.imageApi || !tempFileId) {
      return;
    }

    try {
      await this.imageApi.deleteImage(tempFileId);
    } catch (error) {
      console.error("Erro ao deletar imagem temporária:", error.message, error);
      // Não propaga o erro, pois é uma operação de limpeza
    }
  }

  /**
   * Envia os dados do formulário de usuário para criação ou atualização
   * @param {Object} formData - Dados do formulário de usuário
   * @param {string|number|null} userId - ID do usuário para atualização, ou null para criação
   * @returns {Promise<Object>} Resposta da API
   * @throws {Error} Erro ao enviar dados do usuário
   */
  async submitUserForm(formData, userId = null) {
    try {
      // Mapeia os dados do formulário para o formato da API
      formData = mapFormUserToApiUser(formData);
      let response;

      if (userId) {
        // Caso de atualização: remove a senha, pois ela deve ser alterada por um fluxo específico
        delete formData.password;

        response = await this.apiService(`/api/user/${userId}`, {
          method: "PATCH",
          data: formData,
        });
      } else {
        // Caso de criação: envia todos os dados, incluindo a senha
        response = await this.apiService("/api/user/register", {
          method: "POST",
          data: formData,
        });
      }

      // Verifica se a resposta indica erro
      if (!response.ok) {
        const errorMessage =
          response.error || response.message || "Erro no cadastro";
        throw new Error(`Falha na operação: ${errorMessage}`);
      }

      return response;
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const operation = userId ? "atualizar" : "criar";
      const errorMessage =
        error.message || `Erro desconhecido ao ${operation} usuário`;
      console.error(`Erro no UserService (${operation}):`, errorMessage, error);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao ${operation} usuário: ${errorMessage}`);
    }
  }

  /**
   * Processa o envio completo do formulário, incluindo upload de imagem
   * @param {Object} formData - Dados do formulário de usuário
   * @param {string|number|null} userId - ID do usuário para atualização, ou null para criação
   * @param {Function} setImageCallback - Função para atualizar a imagem no estado após confirmação
   * @returns {Promise<Object>} Resultado da operação
   * @throws {Error} Erro ao processar o formulário
   */
  async processUserFormWithImage(
    formData,
    userId = null,
    setImageCallback = null
  ) {
    let tempFileId = null;

    try {
      // Se houver uma nova imagem, faz o upload
      if (formData.picture instanceof File) {
        tempFileId = await this._processImageUpload(formData.picture);
        formData.picture = tempFileId;
      }

      // Envia os dados do formulário
      const response = await this.submitUserForm(formData, userId);

      // Se o upload da imagem foi bem-sucedido, confirma o upload
      if (tempFileId) {
        try {
          const imageUrl = await this._confirmImageUpload(tempFileId);

          // Atualiza a imagem no estado se o callback for fornecido
          if (typeof setImageCallback === "function") {
            setImageCallback(imageUrl);
          }
        } catch (confirmError) {
          // Erro na confirmação da imagem não impede o salvamento do usuário
          console.warn(
            "Usuário salvo, mas houve um problema com a imagem:",
            confirmError.message
          );
          return {
            success: true,
            warning: "Usuário salvo, mas houve um problema com a imagem.",
            data: response,
          };
        }
      }

      return {
        success: true,
        data: response,
      };
    } catch (err) {
      // Se houve erro e existe um arquivo temporário, tenta excluí-lo
      if (tempFileId) {
        await this._deleteTemporaryImage(tempFileId);
      }

      // Propaga o erro
      throw err;
    }
  }
}

export default UserService;
