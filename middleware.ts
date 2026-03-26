import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Minimal middleware - auth is handled at the layout level
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
