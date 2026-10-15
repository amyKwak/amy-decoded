import { NextResponse, type NextRequest } from "next/server";
import { GATE_COOKIE, gatedProjectFor, isUnlocked } from "@/lib/gate";

// Invite links from the host's phone. Guests only sync with the host, who is
// the one calling Claude, so they can join without the password.
const INVITE_PARAMS = ["room", "join"];

export function proxy(request: NextRequest) {
  if (isUnlocked(request.cookies.get(GATE_COOKIE)?.value)) return NextResponse.next();

  const { pathname, search, searchParams } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    return Response.json(
      { error: "This project requires a password." },
      { status: 401 },
    );
  }

  if (gatedProjectFor(pathname) && INVITE_PARAMS.some((p) => searchParams.has(p))) {
    return NextResponse.next();
  }

  const unlock = new URL("/unlock", request.url);
  unlock.searchParams.set("next", pathname + search);
  return NextResponse.redirect(unlock);
}

export const config = {
  matcher: [
    "/projects/meme/:path*",
    "/projects/lucky-goose/:path*",
    "/projects/clueless/:path*",
    "/projects/noggin/:path*",
    "/projects/moody/:path*",
    "/api/meme/:path*",
    "/api/lucky-goose/:path*",
    "/api/clueless/:path*",
    "/api/noggin/:path*",
    "/api/moody/:path*",
  ],
};
