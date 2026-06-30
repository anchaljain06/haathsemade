import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import User from "@/models/User";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, phone } = await req.json();

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    user._id,
    { name, phone },
    { new: true }
  );

  return NextResponse.json({ user: updated });
}
