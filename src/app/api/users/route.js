import { NextResponse } from "next/server";
import { createOrUpdateUser } from "@/businnes/compoundRules/userCompoundRules";
import { withApiAuthRequired } from "@auth0/nextjs-auth0";

export const POST = withApiAuthRequired(async function create(req) {
  try {
    const user = await req.json();

    const result = await createOrUpdateUser(user);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create or update user" },
      { status: 500 }
    );
  }
});
