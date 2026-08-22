import type { DefaultSession } from "next-auth";

/**
 * `id` is the Mongo `_id`, not Google's `sub` — every route that scopes data to
 * a user (orders, requests, addresses) keys off the Mongo document.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: string;
  }
}
