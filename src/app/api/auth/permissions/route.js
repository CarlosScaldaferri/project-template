// src/app/api/auth/permissions/route.js
const { NextResponse } = require("next/server");
const { getServerSession } = require("next-auth");
const { authOptions } = require("@/app/api/auth/[...nextauth]/route");
const { default: db } = require("../../../../../prisma/db");

async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module"); // Ex: "/user/register"

    const rules = await db.rule.findMany({
      where: {
        OR: [
          { user_id: session.user.id }, // Permissões diretas
          {
            role: {
              user_role: {
                some: { user_id: session.user.id },
              },
            },
          }, // Permissões herdadas de roles
        ],
        path: { path: { startsWith: module } },
      },
    });

    // Formata as permissões para o frontend
    const permissions = {
      create: rules.some((r) => r.create),
      read: rules.some((r) => r.read),
      update: rules.some((r) => r.update),
      delete: rules.some((r) => r.delete),
    };

    return NextResponse.json(permissions);
  } catch (error) {
    console.error("Erro ao buscar permissões:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}

module.exports = { GET };
