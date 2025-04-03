// src/frontend/services/userService.js
import { mapFormUserToApiUser } from "@/frontend/businnes/mappers/userMapper";
import { cleanUserDataForForm } from "@/frontend/businnes/mappers/userMapper";
import { applyTelephoneMask } from "@/shared/businnes/rules/generalRules";

class UserService {
  constructor(apiService) {
    this.apiService = apiService;
  }

  async fetchUserData(userId, setUserData, setIsFetched) {
    try {
      const data = await this.apiService(`/api/user/${userId}`);
      const cleanData = cleanUserDataForForm(data);

      setUserData({
        id: cleanData.id, // Substituído sub por id
        name: cleanData.name || "",
        nickname: cleanData.nickname || "",
        picture: cleanData.picture || "",
        birth_date: cleanData.birth_date
          ? new Date(cleanData.birth_date).toISOString().split("T")[0]
          : "",
        cpf: cleanData.cpf || "",
        addresses: cleanData.addresses, // Já limpo pelo cleanUserDataForForm
        emails: cleanData.emails.map((email) => ({
          ...email,
          email_verified: email.email_verified ?? null,
        })),
        telephones: cleanData.telephones.map((phone) => ({
          ...phone,
          telephone: applyTelephoneMask(phone.telephone), // Ajustado de full_number para telephone
        })),
      });
      setIsFetched(true);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setIsFetched(true);
      throw error;
    }
  }

  // src/frontend/services/userService.js
  async submitUserForm(formData, userId = null) {
    try {
      formData = mapFormUserToApiUser(formData);
      let response;

      if (userId) {
        //removendo password em caso de edicao
        delete formData.password;

        response = await this.apiService(`/api/user/${userId}`, {
          method: "PATCH",
          data: formData,
        });
      } else {
        response = await this.apiService("/api/user/register", {
          method: "POST",
          data: formData,
        });
      }

      // Assume que response já é um objeto parseado
      if (!response.ok) {
        throw new Error(
          response.error || response.message || "Erro no cadastro"
        );
      }

      return response; // Retorna diretamente o objeto
    } catch (error) {
      console.error("Erro no UserService:", error);
      throw error;
    }
  }
}

export default UserService;
