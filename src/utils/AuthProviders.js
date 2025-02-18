"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { Auth0Provider } from "@auth0/auth0-react";

const AuthProviders = ({ children }) => {
  return (
    <Auth0Provider
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN}
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined" ? window.location.origin : "",
      }}
    >
      {<AuthProvider>{children}</AuthProvider>}
    </Auth0Provider>
  );
};

export default AuthProviders;
