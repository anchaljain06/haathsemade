import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/**
 * The signed-in user's Mongo document, or null.
 *
 * The session carries the Mongo `_id` (put there by the `jwt` callback in
 * `auth.ts`), so this is a single lookup by primary key. Every route that scopes
 * data to a user goes through here rather than trusting an id from the request.
 */
export async function getCurrentUser() {
  const session = await auth();

  const userId = session?.user?.id;
  if (!userId) return null;

  await connectDB();

  return User.findById(userId);
}
