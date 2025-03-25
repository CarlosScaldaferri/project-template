// src/services/auth0Service.js
import { mapFormUserToAuth0User } from "@/businnes/mappers/userMapper";

class Auth0Service {
  constructor(apiService, auth0ClientId, domain) {
    this.apiService = apiService;
    this.auth0ClientId = auth0ClientId;
    this.domain = domain || process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    this.baseUrl = `https://${this.domain}`;
  }

  // Obtém o token de gerenciamento do Auth0
  async fetchManagementToken() {
    const response = await fetch("/api/auth/token/management-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Erro ao buscar token");
    return data.token;
  }

  // Garante que o token de gerenciamento esteja disponível
  async ensureManagementToken(auth0ManagementToken) {
    return auth0ManagementToken || (await this.fetchManagementToken());
  }

  // Cria um usuário no Auth0
  async createAuth0User(formData) {
    const token = await this.ensureManagementToken();
    const primaryEmail = formData.emails.find((e) => e.is_main)?.email;
    if (!primaryEmail) throw new Error("E-mail principal é necessário");

    const payload = {
      email: primaryEmail,
      email_verified: false,
      password: "TempPass123!",
      name: formData.name,
      nickname: formData.nickname,
      picture: formData.picture,
      connection: "Username-Password-Authentication",
    };

    const response = await this.apiService.request(`/api/v2/users`, {
      method: "POST",
      data: payload,
      baseUrl: this.baseUrl,
      token,
    });

    // Solicita redefinição de senha
    await this.apiService.request(`/dbconnections/change_password`, {
      method: "POST",
      baseUrl: this.baseUrl,
      data: {
        client_id: this.auth0ClientId,
        email: primaryEmail,
        connection: "Username-Password-Authentication",
      },
    });

    return response.user_id;
  }

  // Atualiza um usuário no Auth0
  async updateAuth0User(sub, formData) {
    const token = await this.ensureManagementToken();
    const auth0MappedUser = mapFormUserToAuth0User(formData);

    await this.apiService.request(`/api/v2/users/${sub}`, {
      method: "PATCH",
      data: auth0MappedUser,
      baseUrl: this.baseUrl,
      token,
    });
  }

  // Envia email de redefinição de senha
  async requestPasswordReset(email) {
    await this.apiService.request(`/dbconnections/change_password`, {
      method: "POST",
      baseUrl: this.baseUrl,
      data: {
        client_id: this.auth0ClientId,
        email,
        connection: "Username-Password-Authentication",
      },
    });
  }
}

export default Auth0Service;
