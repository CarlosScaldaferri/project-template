import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Verifica se há corpo na requisição
    if (!request.body) {
      return NextResponse.json(
        { ok: false, message: "Nenhum dado enviado" },
        { status: 400 }
      );
    }

    let body;
    try {
      // Tenta parsear o JSON
      body = await request.json();
    } catch (jsonError) {
      console.error("Erro ao parsear JSON:", jsonError);
      return NextResponse.json(
        { ok: false, message: "Formato de dados inválido" },
        { status: 400 }
      );
    }

    // Extrai o fileId do corpo parseado
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { ok: false, message: "ID do arquivo não fornecido" },
        { status: 400 }
      );
    }

    // Remove barras extras e normaliza o caminho
    const normalizedPath = fileId.replace(/^\/+|\/+$/g, "");
    const cleanPath = normalizedPath.replace(/^uploads\//, "");

    return NextResponse.json(
      {
        ok: true,
        url: `/uploads/${cleanPath}`,
        message: "Upload confirmado com sucesso",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na confirmação:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Erro ao confirmar upload",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
