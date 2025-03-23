import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAccessToken } from "@/utils/getAccessToken";

export async function GET(req) {
  try {
    const cookieStore = await cookies(); // Await cookies()

    const { accessToken } = await getAccessToken(req, cookieStore);
    if (!accessToken) {
      throw new Error("getAccessToken returned no access token");
    }

    cookieStore.set("appSession", accessToken, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 dia
    });

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error("Error in /api/auth/token/access-token:", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to get access token", details: error.message },
      { status: 500 }
    );
  }
}
