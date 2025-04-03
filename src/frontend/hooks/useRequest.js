"use client";
import { useCallback, useState } from "react";

const useRequest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetched, setIsFetched] = useState(false);

  const request = useCallback(
    async (
      endpoint,
      {
        method = "GET",
        data = null,
        headers = {},
        baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
      } = {}
    ) => {
      setIsLoading(true);
      setError(null);
      setIsFetched(false);

      const normalizedEndpoint = endpoint.startsWith("/")
        ? endpoint
        : `/${endpoint}`;
      const url = `${baseUrl}${normalizedEndpoint}`;

      // Configuração dos headers
      const finalHeaders = {
        "Content-Type": "application/json",
        ...headers,
      };

      // Configuração do fetch
      const fetchOptions = {
        method,
        headers: finalHeaders,
        body: data ? JSON.stringify(data) : undefined,
      };

      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          let errorMessage;

          switch (response.status) {
            case 400:
              errorMessage = errorData.message || "Requisição inválida.";
              break;
            case 401:
              errorMessage =
                errorData.message || "Não autorizado. Faça login novamente.";
              break;
            case 403:
              errorMessage =
                errorData.message || "Acesso negado a este recurso.";
              break;
            case 404:
              errorMessage = errorData.message || "Recurso não encontrado.";
              break;
            case 500:
              errorMessage =
                errorData.message ||
                "Erro no servidor. Tente novamente mais tarde.";
              break;
            default:
              errorMessage =
                errorData.message || `Erro na requisição: ${response.status}`;
          }

          const error = new Error(errorMessage);
          error.status = response.status;
          throw error;
        }

        const responseData = await response.json();
        setIsFetched(true);
        return responseData;
      } catch (error) {
        if (!error.status) {
          error.message = "Erro de rede. Verifique sua conexão.";
        }
        console.error(`Erro ao acessar ${url}:`, error);
        setError(error);
        setIsFetched(true);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [] // Mantemos na dependência, mas poderia remover se não usar
  );

  return {
    request,
    isLoading,
    error,
    isFetched,
    setError,
  };
};

export default useRequest;
