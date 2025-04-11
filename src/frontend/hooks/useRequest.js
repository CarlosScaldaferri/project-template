"use client";
import { fetchRequest } from "@/shared/general/fetchRequest";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook para fazer requisições à API
 * @returns {Object} Objeto com funções e estados para fazer requisições
 */
const useRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Função para fazer requisições à API
   * @param {string} endpoint - Endpoint da API
   * @param {Object} options - Opções da requisição
   * @returns {Promise<Object>} Resposta da API no formato { ok, data, error }
   */
  const request = useCallback(async (endpoint, options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`useRequest: Fazendo requisição para ${endpoint}`);
      const response = await fetchRequest(endpoint, options);
      console.log(`useRequest: Resposta recebida:`, response);

      // Se houver um erro na resposta, atualiza o estado de erro
      if (!response.ok && response.error) {
        if (isMounted.current) {
          setError(new Error(response.error));
        }
      }

      return response;
    } catch (err) {
      console.error(`useRequest: Erro na requisição para ${endpoint}:`, err);

      // Formata o erro para manter consistência
      const formattedError = {
        ok: false,
        data: null,
        error: err.message || "Erro na requisição",
      };

      if (isMounted.current) {
        setError(err);
      }
      return formattedError;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  return { request, isLoading, error };
};

export default useRequest;
