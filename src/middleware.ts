import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Allow demo mode: if the demo cookie is set, skip Supabase auth
  const isDemo = request.cookies.get("sb-demo-mode")?.value === "1";
  const isProtectedPath = ["/dashboard", "/learn", "/practice", "/quiz", "/settings", "/progress", "/ai-tutor", "/text-to-sign", "/speech-to-sign", "/achievements", "/community"].some(
    (p) => request.nextUrl.pathname.startsWith(p)
  );

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
