import apiService from "@/services/apiService";

const useFetch = () => {
  return async (token, endpoint) => {
    try {
      return apiService.fetchData(token, endpoint);
    } catch (error) {
      console.error("Erro ao obter token:", error);
      throw error;
    }
  };
};

export default useFetch;
