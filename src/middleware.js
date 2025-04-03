import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const { pathname } = request.nextUrl;

  // Rotas públicas (acesso sem login)
  const publicRoutes = [
    "/user/login",
    "/user/register$", // Regex: só "/user/register" (sem parâmetros)
    "/api/auth/(.*)",
    "/api/user/register",
  ];

  // Verifica se a rota é pública
  const isPublicRoute = publicRoutes.some((route) => {
    const regex = new RegExp(`^${route.replace("$", "\\$")}$`); // Trata o "$" como fim de string
    return regex.test(pathname);
  });

  // Libera rotas públicas
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ------ Rotas protegidas ------
  // Bloqueia /user/register/:userId se não tiver token
  if (pathname.startsWith("/user/register/") && !token) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  // Demais regras de proteção (APIs, dashboard, etc.)
  if (!token) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/user")) {
      return NextResponse.redirect(new URL("/user/login", request.url));
    }
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/user/:path*", // Cobre /user/register e /user/register/:id
    "/dashboard",
    "/api/img/(.*)",
    "/api/user/(.*)",
  ],
};
