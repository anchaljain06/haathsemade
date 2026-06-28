import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) return null;

  await connectDB();

  const user = await User.findOne({ clerkId: userId });
  return user;
}