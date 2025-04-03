// src/app/api/user/register/route.js
import { NextResponse } from "next/server";
import backendUserService from "@/backend/services/userService";
import { createApiHandler } from "@/backend/lib/apiHandler";
import { requireAuth, requirePermission } from "@/backend/middleware/midleware";

// Define a lógica principal da rota
const handler = async (request) => {
  const userData = await request.json();

  // Cria o usuário no banco
  const result = await backendUserService.createUser(userData);

  if (!result.ok) {
    throw new Error(result.error || "Erro ao criar usuário");
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Usuário cadastrado com sucesso!",
      data: result.data,
    },
    { status: 201 }
  );
};

// Exporta a rota com o handler e middlewares aplicados
export const POST = createApiHandler(handler, [
  requireAuth,
  requirePermission("/user/register", "create"),
]);
