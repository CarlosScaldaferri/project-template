import { createContext, useEffect, useMemo, useState } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import apiService from "@/services/apiService";
import PropTypes from "prop-types";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: auth0User, isLoading } = useUser();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const updateUser = async () => {
      if (auth0User?.sub) {
        try {
          setAccessToken(auth0User.accessToken);
          const response = await apiService.request("/api/users", {
            user: accessToken,
            method: "POST",
            data: auth0User,
          });
          setUser(response);
        } catch (error) {
          console.error("Erro ao criar ou atualizar usuário:", error);
          setError(error);
        }
      }
    };

    if (auth0User && !isLoading) {
      updateUser();
    }
  }, [auth0User, isLoading]);

  const value = useMemo(
    () => ({ user, error, isLoading, accessToken }),
    [user, error, isLoading, accessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
