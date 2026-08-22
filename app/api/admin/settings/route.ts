import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { parseBody } from "@/lib/validate";
import { settingsUpdateSchema } from "@/schemas/zodValidations";
import Settings from "@/models/Settings";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseBody(req, settingsUpdateSchema);
  if (parsed.response) return parsed.response;
  const { whatsappNumber } = parsed.data;

  await connectDB();

  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({ whatsappNumber });
  } else {
    settings.whatsappNumber = whatsappNumber;
    await settings.save();
  }

  return NextResponse.json({ whatsappNumber: settings.whatsappNumber });
}

