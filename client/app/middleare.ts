import { NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // Always allow public routes
  if (isPublicRoute) return NextResponse.next();

  // Since token is in localStorage (client-side only),
  // middleware can't read it. So we rely on AuthGuard for protection.
  // Middleware just handles root redirect.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)"],
};
