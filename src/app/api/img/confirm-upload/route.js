import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json(
        { ok: false, message: "ID do arquivo não fornecido" },
        { status: 400 }
      );
    }

    const tempDir = path.join(process.cwd(), "public", "temp");
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const tempPath = path.join(tempDir, fileId);
    const finalPath = path.join(uploadsDir, fileId);

    // Verifica se o arquivo temporário existe
    await fs.access(tempPath);

    // Garante que o diretório de uploads existe
    await fs.mkdir(uploadsDir, { recursive: true });

    // Move o arquivo para a pasta permanente
    await fs.rename(tempPath, finalPath);

    // Retorna a URL completa com a extensão preservada
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    return NextResponse.json(
      {
        ok: true,
        url: `${baseUrl}/uploads/${fileId}`,
        message: "Upload confirmado com sucesso",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro na confirmação:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao confirmar upload" },
      { status: 500 }
    );
  }
}
