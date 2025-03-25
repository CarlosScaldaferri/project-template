import { findUserBySub } from "@/services/userService";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = await params; // Desestruturação direta de params, que já é resolvido

    const user = await findUserBySub(id, {
      email: true,
      address: true,
      telephone: true,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
