// useAccessToken.js
import { useState, useEffect } from "react";

const useAccessToken = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const response = await fetch("/api/auth/token/access-token", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.details || `HTTP error: ${response.status}`
          );
        }

        const data = await response.json();
        if (!data.accessToken) {
          throw new Error("No accessToken in response");
        }

        setAccessToken(data.accessToken);
        setError(null);
      } catch (error) {
        console.error("Client error fetching accessToken:", {
          message: error.message,
          stack: error.stack,
        });
        setError(error.message);
        setAccessToken(null);
      }
    };

    fetchAccessToken();
  }, []);

  return { accessToken, error };
};

export default useAccessToken;
