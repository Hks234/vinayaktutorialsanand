import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

type Role = "admin" | "faculty" | "student";

async function readToken(token?: string) {
  if (!token || !process.env.AUTH_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.AUTH_SECRET));
    const role = payload.role;
    if (role !== "admin" && role !== "faculty" && role !== "student") return null;
    return { role: role as Role, mpc: Boolean(payload.mpc) };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role: Role | null = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/student")
      ? "student"
      : pathname.startsWith("/faculty")
        ? "faculty"
        : null;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (!role || pathname === `/${role}` || pathname === "/faculty") {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const isLogin = pathname === `/${role}/login`;
  const session = await readToken(request.cookies.get("vt_session")?.value);

  if (isLogin) {
    if (session?.role === role) {
      const url = request.nextUrl.clone();
      url.pathname = session.mpc ? `/${role}/settings` : `/${role}/dashboard`;
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!session || session.role !== role) {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/login`;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session.mpc && !pathname.startsWith(`/${role}/settings`)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${role}/settings`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/faculty/:path*"],
};
