/**
 * Função para fazer requisições à API
 * @param {string} endpoint - Endpoint da API
 * @param {Object} options - Opções da requisição
 * @param {string} [options.method="GET"] - Método HTTP
 * @param {Object|FormData|null} [options.data=null] - Dados a serem enviados
 * @param {Object} [options.headers={}] - Headers da requisição
 * @param {string} [options.baseUrl=process.env.NEXT_PUBLIC_BASE_URL] - URL base da API
 * @param {string|null} [options.token=null] - Token de autenticação
 * @param {number} [options.timeout=30000] - Timeout da requisição em milissegundos
 * @returns {Promise<Object>} Resposta da API no formato { ok, data, error }
 */
export async function fetchRequest(
  endpoint,
  {
    method = "GET",
    data = null,
    headers = {},
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL,
    token = null,
    timeout = 30000,
  } = {}
) {
  const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log(`Fazendo requisição para: ${url}`);
    console.log(`Método: ${method}`);
    console.log(`Dados:`, data);

    const response = await fetch(url, {
      method,
      headers: {
        ...(data instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body:
        data instanceof FormData
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Tenta obter os dados da resposta
    let responseData;
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json();
      console.log("Resposta JSON recebida:", responseData);
    } else {
      const text = await response.text();
      console.log("Resposta texto recebida:", text);

      try {
        // Tenta converter o texto para JSON
        responseData = JSON.parse(text);
      } catch (e) {
        // Se não for JSON, usa o texto como está
        responseData = { message: text };
      }
    }

    // Verifica se a resposta já está no formato esperado
    if (
      responseData &&
      typeof responseData === "object" &&
      "ok" in responseData &&
      "data" in responseData
    ) {
      return responseData;
    }

    // Se a resposta não estiver no formato esperado, formata-a
    if (!response.ok) {
      return {
        ok: false,
        data: null,
        error:
          responseData.message ||
          responseData.error ||
          `Erro ${response.status}: ${response.statusText}`,
      };
    }

    return {
      ok: true,
      data: responseData,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Erro na requisição:", error);

    return {
      ok: false,
      data: null,
      error: error.message || "Erro na requisição",
    };
  }
}
