import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Routes anyone can reach signed out. Everything else requires a session.
 */
const PUBLIC_PATHS = [
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/custom-orders",
  // Device-local (localStorage) — nothing user-specific is fetched, so it works
  // signed out.
  "/wishlist",
];

const PUBLIC_PREFIXES = [
  "/products",
  "/categories",
  "/gallery",
  "/login",
  "/api/auth",
  "/api/products",
  "/api/categories",
  "/api/settings",
];

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  );
}

/**
 * This runs in the edge runtime, which can't reach MongoDB — so it can only
 * establish *authentication*. Admin *authorization* is enforced by
 * app/admin/layout.tsx and by an explicit role check in every /api/admin/**
 * route handler. Do not add an admin route that relies on this middleware
 * alone to keep non-admins out.
 *
 * The role on the session token is not trusted here for the same reason: it is
 * set at sign-in and would go stale if an admin were demoted mid-session.
 */
export default auth((req) => {
  const { pathname, search } = req.nextUrl;

  if (isPublic(pathname) || req.auth) return NextResponse.next();

  // API callers get a status they can act on; page requests get bounced to
  // sign-in with a return path.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const login = new URL("/login", req.nextUrl.origin);
  login.searchParams.set("redirect", `${pathname}${search}`);
  return NextResponse.redirect(login);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
