const apiService = {
  request: async (
    endpoint,
    { token, method = "GET", data = null, headers = {} } = {}
  ) => {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
          "Content-Type": "application/json",
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Erro na requisição: ${response.status}`
        );
      }

      return response.json();
    } catch (error) {
      console.error(`Erro ao acessar ${url}:`, error);
      throw error;
    }
  },
};

export default apiService;
