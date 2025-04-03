// src/backend/middleware/middleware.js
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkPermission } from "@/backend/lib/authValidator";
import { authOptions } from "../../app/api/auth/[...nextauth]/route";

// Função para executar middlewares em sequência
export function composeMiddlewares(...middlewares) {
  return async (request) => {
    for (const middleware of middlewares) {
      const result = await middleware(request);
      if (result instanceof Response || result instanceof NextResponse) {
        return result; // Para a execução se um middleware retornar uma resposta
      }
    }
    return null; // Continua para o handler principal
  };
}

// Middleware de autenticação básico
export async function requireAuth(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response("Não autorizado", { status: 401 });
  }
  request.session = session; // Anexa a sessão ao request
  return null;
}

// Middleware de autorização baseado em políticas
export function requirePermission(resource, action) {
  return async (request) => {
    if (!request.session) {
      throw new Error("requireAuth deve ser usado antes de requirePermission");
    }

    if (!request.session.isAdmin) {
      const canAccess = await checkPermission(
        request.session.user.id,
        resource,
        action
      );
      if (!canAccess) {
        return NextResponse.json(
          { error: "Acesso negado: permissão insuficiente" },
          { status: 403 }
        );
      }
    }
    return null;
  };
}
