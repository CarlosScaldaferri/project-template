// app/api/auth0-token/route.js
export async function POST(req) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN_M2M;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID_M2M;
  const clientSecret = process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET_M2M;
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE_M2M;

  if (!domain || !clientId || !clientSecret || !audience) {
    return new Response(
      JSON.stringify({ error: "Configuração do Auth0 incompleta" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await fetch(`https://${domain}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        audience: audience,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({ error: errorData.message || "Erro ao gerar token" }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify({ token: data.access_token }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao gerar token no servidor:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno ao gerar token" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
