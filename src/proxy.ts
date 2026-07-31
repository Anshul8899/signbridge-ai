import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Demo mode: if the cookie is set, skip Supabase auth entirely
  const isDemo = request.cookies.get("sb-demo-mode")?.value === "1";
  const isProtectedPath = [
    "/dashboard", "/learn", "/practice", "/quiz",
    "/settings", "/progress", "/ai-tutor",
    "/text-to-sign", "/speech-to-sign", "/achievements", "/community",
  ].some((p) => request.nextUrl.pathname.startsWith(p));

  if (isDemo && isProtectedPath) {
    return NextResponse.next();
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
