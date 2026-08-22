import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * Auth.js configuration.
 *
 * Sessions are JWT-based, not database-backed, so there is no adapter: the app
 * already owns a Mongo `User` document and we keep that as the single source of
 * truth. The `signIn` callback upserts it, and the `jwt` callback stashes the
 * Mongo `_id` and `role` on the token so `getCurrentUser()` and the middleware
 * can act without a database round-trip on every request.
 *
 * Google is the only provider. Anything that needs a phone number collects it
 * in the app (see the PHONE_REQUIRED gate on checkout), because Google does not
 * hand one over.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Ask for the minimum. We only need identity, not Gmail or anything else.
      authorization: {
        params: { scope: "openid email profile", prompt: "select_account" },
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: { strategy: "jwt" },

  callbacks: {
    /**
     * Upsert the Mongo user on every sign-in.
     *
     * Match order matters. `googleId` is the durable key, but users who
     * predate this migration only have an email, so fall back to that and
     * backfill `googleId` — otherwise a returning customer would get a second
     * document and lose their order history.
     */
    async signIn({ profile }) {
      const email = profile?.email;
      const googleId = profile?.sub;

      // Google can technically return an unverified email; refuse those rather
      // than letting one match an existing account by address.
      if (!email || !googleId || profile?.email_verified === false) return false;

      await connectDB();

      const existing =
        (await User.findOne({ googleId })) ?? (await User.findOne({ email }));

      if (existing) {
        existing.googleId = googleId;
        // Keep the display name and picture fresh, but never touch `role` or
        // `phone` — those are owned by the app, not by Google.
        if (profile.name) existing.name = profile.name;
        if (profile.picture) existing.image = profile.picture as string;
        await existing.save();
        return true;
      }

      await User.create({
        googleId,
        email,
        name: profile.name ?? "Customer",
        image: (profile.picture as string) ?? "",
        phone: "",
      });

      return true;
    },

    /**
     * Runs on sign-in (when `profile` is present) and on every subsequent
     * token read. Only hit Mongo on the sign-in pass; after that the ids ride
     * along on the token.
     */
    async jwt({ token, profile }) {
      if (profile?.sub) {
        await connectDB();
        const user = await User.findOne({ googleId: profile.sub }).select(
          "_id role"
        );
        if (user) {
          token.userId = user._id.toString();
          token.role = user.role;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.userId as string) ?? "";
        session.user.role = (token.role as string) ?? "customer";
      }
      return session;
    },
  },
});
