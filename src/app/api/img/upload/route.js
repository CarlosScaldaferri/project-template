import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Preserva a extensão do arquivo original
    const fileExt = path.extname(file.name);
    const fileId = `${uuidv4()}${fileExt}`; // UUID + extensão original

    const tempDir = path.join(process.cwd(), "public", "temp");
    const filePath = path.join(tempDir, fileId);

    // Garante que o diretório existe
    await fs.mkdir(tempDir, { recursive: true });

    // Converte e salva o arquivo
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return NextResponse.json(
      {
        ok: true,
        fileId, // Retorna o ID com extensão
        message: "Upload temporário realizado com sucesso",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no upload temporário:", error);
    return NextResponse.json(
      { ok: false, message: "Erro no processamento do arquivo" },
      { status: 500 }
    );
  }
}
