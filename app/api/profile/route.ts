import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { profileUpdateSchema } from "@/schemas/zodValidations";
import User from "@/models/User";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, profileUpdateSchema);
  if (parsed.response) return parsed.response;

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    user._id,
    // Only the fields the schema allows — never the raw body, so `role`
    // can't be smuggled in.
    { $set: parsed.data },
    { new: true }
  );

  return NextResponse.json({ user: updated });
}
