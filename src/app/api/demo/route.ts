import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/dashboard`);
  response.cookies.set("sb-demo-mode", "1", {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
    httpOnly: false,
    sameSite: "lax",
  });
  return response;
}
