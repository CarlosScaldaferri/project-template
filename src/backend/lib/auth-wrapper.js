// src/lib/auth-wrapper.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export function withAppAuth(handler) {
  return async (req, context) => {
    try {
      const session = await getServerSession(authOptions);

      if (!session) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }

      // Adiciona a sessão ao contexto
      const newContext = {
        ...context,
        session,
      };

      return handler(req, newContext);
    } catch (error) {
      console.error("Erro na autenticação:", error);
      return NextResponse.json(
        { error: "Erro interno no servidor" },
        { status: 500 }
      );
    }
  };
}
