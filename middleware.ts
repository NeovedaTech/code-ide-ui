import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth is handled client-side via AuthContext.
// Middleware is kept as a pass-through to avoid interfering with routing.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
