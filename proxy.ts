import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/products(.*)",
  "/categories(.*)",
  "/gallery(.*)",
  "/custom-orders",
  // Device-local (localStorage) — nothing user-specific is fetched, so it works
  // signed out.
  "/wishlist",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/login(.*)",
  "/api/webhooks(.*)",
  "/api/products(.*)",
  "/api/categories",
  "/api/settings",
]);

export default clerkMiddleware(async (auth, req) => {
  // This runs in the edge runtime, which can't reach MongoDB — so it can only
  // establish *authentication*. Admin *authorization* is enforced by
  // app/admin/layout.tsx and by an explicit role check in every
  // /api/admin/** route handler. Do not add an admin route that relies on
  // this middleware alone to keep non-admins out.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
