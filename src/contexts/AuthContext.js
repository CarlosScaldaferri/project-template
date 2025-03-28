import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import PropTypes from "prop-types";
import useApiService from "@/hooks/useApiService";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { user: auth0UserRaw, isLoading: auth0LoadingRaw } = useUser();
  const auth0User = useMemo(() => auth0UserRaw, [auth0UserRaw?.sub]);
  const auth0Loading = useMemo(() => auth0LoadingRaw, [auth0LoadingRaw]);
  const [selfUser, setSelfUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetched, setIsFetched] = useState(false); // Mantém controle se já foi buscado
  const { request } = useApiService();

  const fetchUserData = useCallback(
    async (id) => {
      if (isFetched || !id) return;

      try {
        const data = await request(`/api/users/${id}`, { method: "GET" });
        setSelfUser({
          sub: data.sub,
          name: data.name || "",
          nickname: data.nickname || "",
          picture: data.picture || "",
          birth_date: data.birth_date || "",
          cpf: data.cpf || "",
          addresses: Array.isArray(data.address) ? data.address : [],
          emails: Array.isArray(data.email)
            ? data.email.map((email) => ({
                ...email,
                email_verified: email.email_verified ?? false,
              }))
            : [],
          telephones: Array.isArray(data.telephone) ? data.telephone : [],
        });
        setError(null);
        setIsFetched(true); // Marca como buscado
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(err.message);
        setIsFetched(true); // Mesmo em erro, marca como buscado
      } finally {
        setIsLoading(false);
      }
    },
    [request, isFetched]
  );

  useEffect(() => {
    if (auth0Loading) {
      if (!isLoading) setIsLoading(true);
      return;
    }
    if (auth0User?.sub && !isFetched) {
      fetchUserData(auth0User.sub);
    } else if (!auth0User?.sub) {
      setSelfUser(null);
      setError(null);
      if (isLoading) setIsLoading(false);
      // Não resetamos isFetched aqui para garantir que só rode uma vez por sessão
    }
  }, [auth0User?.sub]);

  const value = useMemo(
    () => ({
      selfUser,
    }),
    [selfUser, error, isLoading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;
