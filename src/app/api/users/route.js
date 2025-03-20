import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/businnes/compoundRules/userCompoundRules";

const mockUser = {
  name: "CARLOS EDUARDO CRUZEIRO SCALDAFERRI",
  nickname: "carlosscaldaferri",
  picture:
    "https://lh3.googleusercontent.com/a/ACg8ocKEsEtqVcyOutVttqVHDLTVghDU8mV59s-B6qCBXEZTD09CQ78=s96-c",
  birth_date: "1979-11-11T00:00:00.000Z",
  cpf: "111.111.111-11",
  updated_at: "2025-03-18T12:00:00.000Z",
  sub: "google-oauth2|110517540176718517148",

  address: [
    {
      zip_code: 36033270,
      street: "Ruavpetrus Zaka",
      number: 71,
      complement: "11",
      city: "Juiz de Fora",
      state: "MG",
      country: "Brasil",
      district: "Cascatinha",
      is_main: true,
    },
  ],

  email: [
    {
      email: "carlosscaldaferri@gmail.com",
      is_main: true,
      email_verified: true,
    },
  ],

  telephone: [
    {
      country_code: 55,
      state_code: 11,
      number: 111111111,
      full_number: "5511111111111",
      type: "pessoal",
      is_main: true,
    },
  ],
};

export const POST = async function create(req) {
  try {
    const { isAuth0Sync, ...userData } = await req.json();

    const result = await createOrUpdateUser(userData, isAuth0Sync);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error creating or updating user:", error);

    // Verificar tipo de erro e retornar mensagem específica
    if (error.message.includes("PrismaClient")) {
      return NextResponse.json(
        { error: "Database connection error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create or update user", details: error.message },
      { status: 500 }
    );
  }
};
