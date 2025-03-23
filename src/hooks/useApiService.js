import useAccessToken from "@/hooks/useAccessToken";

const useApiService = () => {
  const { accessToken } = useAccessToken();

  const request = async (
    endpoint,
    {
      method = "GET",
      data = null,
      headers = {},
      baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
      token = null, // Novo parâmetro token com valor padrão null
    } = {}
  ) => {
    const normalizedEndpoint = endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;
    const url = `${baseUrl}${normalizedEndpoint}`;

    // Usa o token passado por parâmetro, ou accessToken como fallback
    const finalHeaders = {
      "Content-Type": "application/json",
      ...headers,
      Authorization: token
        ? `Bearer ${token}`
        : accessToken
          ? `Bearer ${accessToken}`
          : undefined,
    };

    try {
      const response = await fetch(url, {
        method,
        headers: finalHeaders,
        body: data ? JSON.stringify(data) : undefined,
      });

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
        error.status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      if (!error.status) {
        error.message = "Erro de rede. Verifique sua conexão.";
      }
      console.error(`Erro ao acessar ${url}:`, error);
      throw error;
    }
  };

  return { request };
};

export default useApiService;
