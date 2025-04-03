import { NextResponse } from "next/server";
import backendUserService from "@/backend/services/userService";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);

    if (!id) {
      return NextResponse.json(
        { error: "ID do usuário não fornecido" },
        { status: 400 }
      );
    }

    // Converta para número se necessário
    const userId = Number(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID do usuário inválido" },
        { status: 400 }
      );
    }

    // Obter parâmetros da URL ou usar false como padrão
    const includeAddress = searchParams.get("address") === "true";
    const includeEmail = searchParams.get("email") === "true";
    const includeTelephone = searchParams.get("telephone") === "true";

    const user = await backendUserService.findUserById(userId, {
      address: includeAddress,
      email: includeEmail,
      telephone: includeTelephone,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Usuário encontrado!",
        data: user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    // 2. Acessar o ID corretamente
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID não fornecido" }, { status: 400 });
    }

    // 3. Converter para número (se necessário)
    const numericId = Number(id);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const userData = await request.json();

    const user = await backendUserService.findUserById(numericId, {
      email: true,
      address: true,
      telephone: true,
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const result = await backendUserService.updateUser(numericId, userData);
    return NextResponse.json(
      result,
      { message: "Usuário atualizado com sucesso" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor", details: error.message },
      { status: 500 }
    );
  }
}
