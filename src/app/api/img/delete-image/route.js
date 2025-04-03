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
    const filePath = path.join(tempDir, fileId);

    try {
      await fs.access(filePath); // Verifica se o arquivo existe
      await fs.unlink(filePath); // Remove o arquivo

      return NextResponse.json(
        { ok: true, message: "Arquivo temporário removido" },
        { status: 200 }
      );
    } catch (error) {
      if (error.code === "ENOENT") {
        return NextResponse.json(
          { ok: false, message: "Arquivo não encontrado" },
          { status: 404 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("Erro ao deletar arquivo temporário:", error);
    return NextResponse.json(
      { ok: false, message: "Erro ao remover arquivo temporário" },
      { status: 500 }
    );
  }
}
