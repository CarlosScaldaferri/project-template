import useAccessToken from "@/hooks/useAccessToken";

const useApiService = () => {
  const { accessToken } = useAccessToken();

  const request = async (
    endpoint,
    { method = "GET", data = null, headers = {} } = {}
  ) => {
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}${normalizedEndpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : undefined,
          "Content-Type": "application/json",
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage;

        // Diferenciação de erros baseada no status HTTP
        switch (response.status) {
          case 400:
            errorMessage = errorData.message || "Requisição inválida.";
            break;
          case 401:
            errorMessage =
              errorData.message || "Não autorizado. Faça login novamente.";
            break;
          case 403:
            errorMessage = errorData.message || "Acesso negado a este recurso.";
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
        error.status = response.status; // Adiciona o status ao erro para uso posterior, se necessário
        throw error;
      }

      return response.json();
    } catch (error) {
      // Captura erros de rede ou outros erros inesperados
      if (!error.status) {
        error.message = "Erro de rede. Verifique sua conexão.";
      }
      console.error(`Erro ao acessar ${url}:`, error);
      throw error; // Re-throw para que o chamador possa tratar, se necessário
    }
  };

  return { request };
};

export default useApiService;
