"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useState, useEffect, useCallback } from "react";
import useApiService from "@/hooks/useApiService";

const useSyncUser = ({ onError } = {}) => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const [syncedUser, setSyncedUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncedUserSub, setLastSyncedUserSub] = useState(() => {
    // Verifica se estamos no cliente antes de acessar sessionStorage
    return typeof window !== "undefined"
      ? sessionStorage.getItem("lastSyncedUserSub") || null
      : null;
  });
  const { request } = useApiService();

  const syncUser = useCallback(
    async (force = false) => {
      if (authLoading || !user) {
        setErrors({ submit: "Dados do usuário indisponíveis" });
        if (onError) onError({ submit: "Dados do usuário indisponíveis" });
        setIsLoading(false);
        return null;
      }

      const hasSyncedForThisUser = lastSyncedUserSub === user.sub;

      if (!force && hasSyncedForThisUser) {
        try {
          const data = await request(`/api/users/${user.sub}`, {
            method: "GET",
          });
          const fetchedUser = {
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
          };
          setSyncedUser(fetchedUser);
          setIsLoading(false);
          return fetchedUser;
        } catch (err) {
          console.error("Erro ao buscar dados do usuário:", err);
          setErrors({ submit: "Erro ao buscar dados: " + err.message });
          if (onError)
            onError({ submit: "Erro ao buscar dados: " + err.message });
          setIsLoading(false);
          return null;
        }
      }

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...user,
            isAuth0Sync: true,
          }),
        });

        if (!response.ok) {
          throw new Error(
            `Erro na requisição: ${response.status} - ${response.statusText}`
          );
        }

        const selfUser = await response.json();
        setSyncedUser(selfUser);
        // Só atualiza se o valor mudou
        if (lastSyncedUserSub !== user.sub) {
          setLastSyncedUserSub(user.sub);
          if (typeof window !== "undefined") {
            sessionStorage.setItem("lastSyncedUserSub", user.sub);
          }
        }
        setIsLoading(false);
        return selfUser;
      } catch (err) {
        console.error("[syncUser] Erro ao sincronizar usuário:", err.message);
        setErrors({ submit: "Erro ao salvar: " + err.message });
        if (onError) onError({ submit: "Erro ao salvar: " + err.message });
        setIsLoading(false);
        return null;
      }
    },
    [authLoading, user, lastSyncedUserSub, request, onError]
  );

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setSyncedUser(null);
      setLastSyncedUserSub(null);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("lastSyncedUserSub");
      }
      setErrors({});
      setIsLoading(false);
      return;
    }

    if (lastSyncedUserSub !== user.sub) {
      syncUser();
    } else {
      setIsLoading(false);
    }
  }, [authLoading, user, lastSyncedUserSub]);

  const forceSync = useCallback(() => {
    return syncUser(true);
  }, [syncUser]);

  return { errors, syncedUser: syncedUser || user, isLoading, forceSync };
};

export default useSyncUser;
