// src/utils/fetchRequest.js
// Sem "use client", pois é puro JavaScript, utilizável em ambos os lados

export async function fetchRequest(
  endpoint,
  {
    method = "GET",
    data = null,
    headers = {},
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
    token = null,
  } = {}
) {
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${baseUrl}${normalizedEndpoint}`;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  const fetchOptions = {
    method,
    headers: finalHeaders,
    body: data ? JSON.stringify(data) : undefined,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  } else {
    fetchOptions.credentials = "same-origin";
  }

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
        errorMessage = errorData.message || "Acesso negado a este recurso.";
        break;
      case 404:
        errorMessage = errorData.message || "Recurso não encontrado.";
        break;
      case 500:
        errorMessage =
          errorData.message || "Erro no servidor. Tente novamente mais tarde.";
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
}
