import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const fileExt = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Retorna APENAS a URL como string
    return NextResponse.json(
      {
        success: true,
        picture: fileName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { success: false, message: "Erro no upload do arquivo" },
      { status: 500 }
    );
  }
}
