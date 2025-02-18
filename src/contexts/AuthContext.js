import { createContext, useEffect, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import apiService from "@/services/apiService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const { user, isLoading } = useUser(); // Hook que retorna o `user` da Auth0

  useEffect(() => {
    const updateUser = async () => {
      if (
        user &&
        user.sub &&
        JSON.stringify(user) !== JSON.stringify(authenticatedUser)
      ) {
        try {
          const response = await apiService.request("/api/users/create", {
            user: user.accessToken,
            method: "POST",
            data: user,
          });
          const { user: newUser } = await response;

          setAuthenticatedUser(newUser);
        } catch (error) {
          console.error("Erro ao criar ou atualizar usuário:", error);
        }
      }
    };

    if (user && !isLoading) {
      updateUser();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user: authenticatedUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
