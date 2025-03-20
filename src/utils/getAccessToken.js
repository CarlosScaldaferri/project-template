export async function getAccessToken(req, cookieStore) {
  try {
    const sessionCookie = await cookieStore.get("appSession"); // Await get()
    if (sessionCookie?.value) {
      return { accessToken: sessionCookie.value };
    }

    // Fallback: Generate a dummy token if no Auth0 (replace with your logic)
    const newToken = `token-${Date.now()}`;
    return { accessToken: newToken };
  } catch (error) {
    console.error("getAccessToken error:", error.message);
    throw error;
  }
}
