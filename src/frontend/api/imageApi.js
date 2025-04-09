/**
 * API de imagem para operações no frontend
 * @module src/frontend/api/imageApi
 */

/**
 * Hook que fornece funções para gerenciar imagens
 * @param {Function} request - Função para fazer requisições à API
 * @returns {Object} Objeto com funções para gerenciar imagens
 */
export const useImageApi = (request) => {
  /**
   * Faz upload de uma imagem
   * @param {File} file - Arquivo de imagem a ser enviado
   * @returns {Promise<string>} URL da imagem enviada
   * @throws {Error} Erro ao fazer upload da imagem
   */
  const uploadImage = async (file) => {
    try {
      // Validação do arquivo
      if (!file) throw new Error("Nenhum arquivo selecionado");
      if (!(file instanceof File)) throw new Error("Tipo de arquivo inválido");

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

      if (file.size > MAX_SIZE)
        throw new Error(`Tamanho máximo: ${MAX_SIZE / 1024 / 1024}MB`);
      if (!ALLOWED_TYPES.includes(file.type))
        throw new Error("Apenas JPEG, PNG ou WEBP");

      // Prepara o FormData
      const formData = new FormData();
      formData.append("file", file);

      // Usa o request fornecido pelo hook useRequest
      const res = await request("/api/img/upload", {
        method: "POST",
        data: formData,
      });

      // Verifica se a resposta foi bem-sucedida
      if (!res.ok) {
        const errorMessage = res.data?.message || "Falha no upload";
        throw new Error(errorMessage);
      }

      // Retorna APENAS a URL como string
      return res.data.picture;
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = error.message || "Erro desconhecido";
      console.error("Erro ao fazer upload de imagem:", errorMessage, error);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao enviar imagem: ${errorMessage}`);
    }
  };

  /**
   * Confirma o upload de uma imagem
   * @param {string} fileId - ID do arquivo a ser confirmado
   * @returns {Promise<string>} URL da imagem confirmada
   * @throws {Error} Erro ao confirmar o upload da imagem
   */
  const confirmUpload = async (fileId) => {
    try {
      // Validação do ID do arquivo
      if (!fileId) throw new Error("ID do arquivo não fornecido");

      // Usa o request fornecido pelo hook useRequest
      const res = await request("/api/img/confirm-upload", {
        method: "POST",
        data: { fileId },
      });

      // Verifica se a resposta foi bem-sucedida
      if (!res.ok) {
        const errorMessage = res.data?.message || "Falha ao confirmar upload";
        throw new Error(errorMessage);
      }

      // Verifica se a URL da imagem foi recebida
      if (!res.data.url) {
        throw new Error("URL da imagem não recebida");
      }

      return res.data.url;
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = error.message || "Erro desconhecido";
      console.error(
        `Erro ao confirmar upload (ID: ${fileId}):`,
        errorMessage,
        error
      );

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao confirmar imagem: ${errorMessage}`);
    }
  };

  /**
   * Exclui uma imagem pelo ID
   * @param {string} fileId - ID do arquivo a ser excluído
   * @returns {Promise<void>}
   * @throws {Error} Erro ao excluir a imagem
   */
  const deleteImage = async (fileId) => {
    try {
      if (!fileId) {
        throw new Error("ID do arquivo não fornecido");
      }

      const res = await request("/api/img/delete-image", {
        method: "POST",
        data: { fileId },
      });

      if (!res.ok) {
        const errorMessage = res.data?.message || "Erro desconhecido";
        throw new Error(`Falha ao deletar imagem: ${errorMessage}`);
      }
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = error.message || "Erro desconhecido";
      console.error(`Erro ao excluir imagem (ID: ${fileId}):`, errorMessage);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(`Falha ao excluir imagem: ${errorMessage}`);
    }
  };

  return { uploadImage, confirmUpload, deleteImage };
};
