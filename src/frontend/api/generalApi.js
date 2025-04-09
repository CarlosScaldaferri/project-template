/**
 * API geral para operações no frontend
 * @module src/frontend/api/generalApi
 */

/**
 * Hook que fornece funções gerais para interagir com APIs externas
 * @param {Function} request - Função para fazer requisições à API
 * @returns {Object} Objeto com funções para interagir com APIs externas
 */
export const useGeneralApi = (request) => {
  /**
   * Busca um endereço pelo CEP usando a API ViaCEP
   * @param {string} cep - CEP a ser consultado (formato: 00000-000 ou 00000000)
   * @returns {Promise<Object|undefined>} Dados do endereço ou undefined se o CEP for inválido
   * @throws {Error} Erro ao buscar CEP
   */
  const fetchAddressByCep = async (cep) => {
    try {
      // Remove todos os não-dígitos (incluindo traço/hífen)
      const cleanedCep = cep.replace(/\D/g, "");

      // Valida se tem 8 dígitos
      if (cleanedCep.length !== 8) {
        console.warn(`CEP inválido: ${cep} (deve ter 8 dígitos)`);
        return undefined;
      }

      // Usa o request fornecido pelo hook useRequest
      // Cria um endpoint proxy para a API ViaCEP
      const res = await request(`/api/proxy/viacep/${cleanedCep}`, {
        method: "GET",
      });

      // Verifica se a resposta contém um erro
      if (!res.ok || res.error) {
        throw new Error(res.error || "Erro na API ViaCEP");
      }

      // Verifica se os dados estão presentes
      if (!res.data) {
        throw new Error("Dados do endereço não encontrados");
      }

      // Retorna os dados formatados
      return {
        logradouro: res.data.logradouro || "",
        bairro: res.data.bairro || "",
        localidade: res.data.localidade || "",
        uf: res.data.uf || "",
      };
    } catch (error) {
      // Melhora a mensagem de erro para facilitar o debugging
      const errorMessage = error.message || "Erro desconhecido";
      console.error(`Erro na busca por CEP ${cep}:`, errorMessage);

      // Propaga o erro com uma mensagem mais descritiva
      throw new Error(
        `Falha ao buscar endereço para o CEP ${cep}: ${errorMessage}`
      );
    }
  };

  return { fetchAddressByCep };
};
